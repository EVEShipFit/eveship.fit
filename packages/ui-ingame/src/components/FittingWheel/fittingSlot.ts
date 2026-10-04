import type { Fit, ItemRef, Rack } from "@eveshipfit/fitting";
import {
  useCharges,
  useDrag,
  useFit,
  useFitStore,
  usePlacement,
  usePreview,
  useSde,
  useType,
  type DragItem,
  type SlotContent,
} from "@eveshipfit/react-hooks";
import type { DragEvent } from "react";

import type { WheelSlotProps } from "../../primitives/Wheel/WheelSlot";
import { nextState } from "./states";

/** EVE does not let rigs and subsystems be put offline. */
const switchedRacks: Rack[] = ["high", "medium", "low", "service"];

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
  const item = content?.item;
  const stats = content?.stats;
  const type = useType(item?.type_id);
  const charges = useCharges(item?.type_id);
  const ref = content?.ref;

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

  const shown: SlotBehaviour = {
    available,
    preview: content?.preview,
    typeId: item?.type_id,
    typeName: type?.name,
    chargeTypeId: item?.charge?.type_id,
    chargeable: charges.length > 0,
    state: stats?.state,
    activatable: stats?.maxState === "active" || stats?.maxState === "overload",
    label: type && stats && `${type.name}, ${stats.state}`,
  };
  if (readOnly) return shown;

  return {
    ...shown,
    onPress: switchable
      ? (event) => store.setState(ref, nextState(stats.state, stats.maxState, event.shiftKey))
      : undefined,
    onDragStart:
      ref === undefined
        ? undefined
        : (event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", type?.name ?? "");
            start({ type: "item", ref });
          },
    onDragEnd: end,
    onDragEnter: () => {
      if (!takes(dragging)) return;
      const slot = { type: rack, index };
      if (dragging.type === "type") {
        const { typeId } = dragging;
        show((draft) => void draft.fit(typeId, slot), target);
      } else {
        const { ref: moved } = dragging;
        show((draft) => draft.move(moved, slot), target);
      }
    },
    onDragLeave: (event) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      clear(target);
    },
    onDragOver: (event) => {
      if (takes(dragging)) allowDrop(event, dragging);
    },
    onDrop: (event) => {
      if (!takes(dragging)) return;
      event.preventDefault();
      clear(target);
      if (dragging.type === "type") store.fit(dragging.typeId, { type: rack, index });
      else store.move(dragging.ref, { type: rack, index });
      end();
    },
    onUnfit: ref === undefined ? undefined : () => store.remove(ref),
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
