import type { Fit, ItemRef, Rack } from "@eveshipfit/fitting";
import {
  useBrowse,
  useCanFit,
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
import { useRef, type DragEvent, type ReactNode } from "react";

import { useContextMenu } from "../../primitives/ContextMenu/ContextMenu";
import { slotAngle } from "../../primitives/Wheel/layout";
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

export type SlotBehaviour = Omit<WheelSlotProps, "rack" | "angle"> & { menu?: ReactNode };

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
  const canFit = useCanFit();
  const { show, clear } = usePreview();
  const { dragging, start, end } = useDrag();
  const shownCopy = useRef(false);
  const { browse } = useBrowse();
  const { show: showInfo } = useShowInfo();
  const { open, menu } = useContextMenu();
  const item = content?.item;
  const stats = content?.stats;
  const type = useType(item?.type_id);
  const charges = useCharges(item?.type_id);
  const ref = content?.ref;
  const chargeTypeId = item?.charge?.type_id;

  const empty = available && item === undefined;
  const switchable = ref !== undefined && stats !== undefined && switchedRacks.includes(rack);

  const target = `${rack}-${index}`;
  const side = rack !== "service" && slotAngle(rack, index) % 360 < 180 ? "left" : "right";
  const takes = (drop: DragItem | undefined): drop is Exclude<DragItem, { type: "hull" }> => {
    if (!available || drop === undefined || drop.type === "hull") return false;
    if (drop.type === "item") return movesTo(fit, drop.ref, rack, index);
    const dropped = sde.type(drop.typeId);
    if (dropped === undefined) return false;
    const place = placement(dropped);
    if (place?.type === "charge") return fitted(fit, rack, index) && charges.includes(dropped);
    return place?.type === rack && (place.type !== "subsystem" || place.index === index) && canFit(dropped);
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
    label: empty ? `Empty ${rackNames[rack]}` : type && stats && `${type.name}, ${stats.state}`,
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

  const unfit = ref === undefined ? undefined : () => store.remove(ref);
  const showModuleInfo =
    item && ref !== undefined
      ? (element: HTMLElement) => showInfo({ typeId: item.type_id, ref }, { element, side })
      : undefined;
  const showChargeInfo =
    chargeTypeId !== undefined && ref !== undefined
      ? (element: HTMLElement) => showInfo({ typeId: chargeTypeId, ref }, { element, side })
      : undefined;
  const removeCharge = ref === undefined ? undefined : () => store.setCharge(ref, undefined);
  const togglePower =
    switchable && stats.maxState !== "offline"
      ? () => store.setState(ref, stats.state === "offline" ? "online" : "offline")
      : undefined;

  return {
    ...shown,
    menu,
    onContextMenu: (event) => {
      if (!available || content?.preview) return;
      const anchor = event.currentTarget.querySelector<HTMLElement>("[data-slot-anchor]") ?? event.currentTarget;
      open(event, [
        showModuleInfo && { label: "Show Info", icon: "module-info", onSelect: () => showModuleInfo(anchor) },
        "separator",
        showChargeInfo && { label: "Show Charge Info", icon: "module-info", onSelect: () => showChargeInfo(anchor) },
        chargeTypeId !== undefined &&
          removeCharge && { label: "Remove Charge", icon: "module-unfit", onSelect: removeCharge },
        "separator",
        { label: "Set Filter for Slot", onSelect: () => browse(rack) },
        unfit && { label: "Unfit", icon: "module-unfit", onSelect: unfit },
        togglePower && {
          label: stats?.state === "offline" ? "Put Online" : "Put Offline",
          icon: "module-power",
          onSelect: togglePower,
        },
      ]);
    },
    actions: dragging === undefined,
    onPress: switchable
      ? (event) => store.setState(ref, nextState(stats.state, stats.maxState, event.shiftKey))
      : empty
        ? () => browse(rack)
        : undefined,
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
    onUnfit: unfit,
    onShowInfo: showModuleInfo,
    onShowChargeInfo: showChargeInfo,
    onRemoveCharge: removeCharge,
    onTogglePower: togglePower,
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

/** Whether the fit has an item in this slot. */
function fitted(fit: Fit, rack: Rack, index: number): boolean {
  return fit.items.some((item) => item.slot.type === rack && "index" in item.slot && item.slot.index === index);
}
