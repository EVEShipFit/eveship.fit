import type { Fit, ItemRef, Rack } from "@eveshipfit/fitting";
import {
  useBrowse,
  useCharges,
  useDrag,
  useFit,
  useFitStore,
  usePlacement,
  usePreview,
  useSde,
  useShowInfo,
  useType,
  type DragItem,
  type SlotContent,
} from "@eveshipfit/react-hooks";
import { useRef, type DragEvent } from "react";

import type { WheelSlotProps } from "../../primitives/Wheel/WheelSlot";
import { ModuleTooltip } from "./ModuleTooltip";
import { nextState } from "./states";

const switchedRacks: Rack[] = ["high", "medium", "low", "rig", "service"];

const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
/** The key that makes dragging a module copy it. */
export const copyKey = mac ? "⌥" : "Ctrl";

/** Whether a dragged module is copied. */
function copies(event: DragEvent): boolean {
  return mac ? event.altKey : event.ctrlKey;
}

const rackNames: Record<Rack, string> = {
  high: "High Slot",
  medium: "Mid Slot",
  low: "Low Slot",
  rig: "Rig Slot",
  subsystem: "Subsystem Slot",
  service: "Service Slot",
};

export type SlotBehaviour = Omit<WheelSlotProps, "rack" | "angle">;

/** What a slot of the fit shows, and what clicking, dragging and dropping on it does. */
export function useFittingSlot(
  rack: Rack,
  index: number,
  content: SlotContent | undefined,
  available: boolean,
  readOnly = false,
): SlotBehaviour {
  const store = useFitStore();
  const sde = useSde();
  const fit = useFit();
  const placement = usePlacement();
  const { show, clear } = usePreview();
  const { dragging, start, end } = useDrag();
  const shownCopy = useRef(false);
  const { browse } = useBrowse();
  const { show: showInfo } = useShowInfo();
  const item = content?.item;
  const stats = content?.stats;
  const type = useType(item?.type_id);
  const charges = useCharges(item?.type_id);
  const ref = content?.ref;
  const chargeTypeId = item?.charge?.type_id;

  const empty = available && item === undefined;
  const switchable = ref !== undefined && stats !== undefined && switchedRacks.includes(rack);

  const target = `${rack}-${index}`;
  const takes = (drop: DragItem | undefined): drop is Exclude<DragItem, { type: "hull" }> => {
    if (!available || drop === undefined || drop.type === "hull") return false;
    if (drop.type === "item") return movesTo(fit, drop.ref, rack, index);
    const dropped = sde.type(drop.typeId);
    if (dropped === undefined) return false;
    const place = placement(dropped);
    if (place?.type === "charge") return ref !== undefined && charges.includes(dropped);
    return place?.type === rack && (place.type !== "subsystem" || place.index === index);
  };

  const showItem = (moved: ItemRef, copy: boolean) => {
    const slot = { type: rack, index };
    shownCopy.current = copy;
    show((draft) => (copy ? draft.copy(moved, slot) : draft.move(moved, slot)), target);
  };

  const shown: SlotBehaviour = {
    available,
    preview: content?.preview,
    typeId: item?.type_id,
    typeName: type?.name,
    chargeTypeId,
    chargeable: charges.length > 0,
    state: stats?.state,
    activatable: stats?.maxState === "active" || stats?.maxState === "overload",
    label: type && stats && `${type.name}, ${stats.state}`,
    tooltip:
      item && stats && ref !== undefined && !content.preview ? (
        <ModuleTooltip
          rack={rack}
          itemRef={ref}
          typeId={item.type_id}
          chargeTypeId={item.charge?.type_id}
          state={stats.state}
          maxState={stats.maxState}
        />
      ) : undefined,
  };
  if (readOnly) return { ...shown, actions: false };

  return {
    ...shown,
    actions: dragging === undefined,
    onPress: switchable
      ? (event) => store.setState(ref, nextState(stats.state, stats.maxState, event.shiftKey))
      : empty
        ? () => browse(rack)
        : undefined,
    label: empty ? `Empty ${rackNames[rack]}` : shown.label,
    onDragStart:
      ref === undefined
        ? undefined
        : (event) => {
            event.dataTransfer.effectAllowed = "copyMove";
            event.dataTransfer.setData("text/plain", type?.name ?? "");
            start({ type: "item", ref });
          },
    onDragEnd: end,
    onDragEnter: (event) => {
      if (!takes(dragging)) return;
      if (dragging.type === "item") {
        showItem(dragging.ref, copies(event));
        return;
      }
      const { typeId } = dragging;
      show((draft) => void draft.fit(typeId, { type: rack, index }), target);
    },
    onDragLeave: (event) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      clear(target);
    },
    onDragOver: (event) => {
      if (!takes(dragging)) return;
      allowDrop(event, dragging);
      if (dragging.type !== "item") return;
      const copy = copies(event);
      if (copy) event.dataTransfer.dropEffect = "copy";
      if (copy !== shownCopy.current) showItem(dragging.ref, copy);
    },
    onDrop: (event) => {
      if (!takes(dragging)) return;
      event.preventDefault();
      clear(target);
      if (dragging.type === "type") store.fit(dragging.typeId, { type: rack, index });
      else if (copies(event)) store.copy(dragging.ref, { type: rack, index });
      else store.move(dragging.ref, { type: rack, index });
      end();
    },
    onUnfit: ref === undefined ? undefined : () => store.remove(ref),
    onShowInfo: item && ref !== undefined ? () => showInfo({ typeId: item.type_id, ref }) : undefined,
    onShowChargeInfo:
      chargeTypeId !== undefined && ref !== undefined ? () => showInfo({ typeId: chargeTypeId, ref }) : undefined,
    onRemoveCharge: ref === undefined ? undefined : () => store.setCharge(ref, undefined),
    onTogglePower:
      switchable && stats.maxState !== "offline"
        ? () => store.setState(ref, stats.state === "offline" ? "online" : "offline")
        : undefined,
  };
}

export function allowDrop(event: DragEvent, dragging: DragItem) {
  event.preventDefault();
  event.dataTransfer.dropEffect = dragging.type === "item" ? "move" : "copy";
}

/** Whether a fitted item can move to this slot. */
function movesTo(fit: Fit, ref: ItemRef, rack: Rack, index: number): boolean {
  const item = fit.items[ref];
  if (item === undefined || rack === "subsystem" || item.slot.type !== rack) return false;
  return "index" in item.slot && item.slot.index !== index;
}
