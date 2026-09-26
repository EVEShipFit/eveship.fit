import type { FitItem, ItemRef, ItemStats, Rack, Stats, Usage } from "@eveshipfit/fitting";

import { useSnapshot } from "./fit.js";

export interface SlotContent {
  readonly index: number;
  /** Absent for an empty slot. */
  readonly ref: ItemRef | undefined;
  readonly item: FitItem | undefined;
  readonly stats: ItemStats | undefined;
}

/**
 * Every slot of a rack, empty ones included. Items in slots the ship does not
 * have (after swapping a subsystem, say) are listed after the real ones.
 */
export function useSlots(rack: Rack): readonly SlotContent[] {
  const { fit, stats } = useSnapshot();

  const byIndex = new Map<number, ItemRef>();
  fit.items.forEach((item, ref) => {
    if (item.slot.type === rack) byIndex.set(item.slot.index, ref);
  });

  const count = Math.max(stats.slots[rack].total, ...Array.from(byIndex.keys(), (index) => index + 1));
  return Array.from({ length: count }, (_, index) => {
    const ref = byIndex.get(index);
    return {
      index,
      ref,
      item: ref === undefined ? undefined : fit.items[ref],
      stats: ref === undefined ? undefined : stats.items[ref],
    };
  });
}

export function useHardpoints(): Stats["hardpoints"] {
  return useSnapshot().stats.hardpoints;
}

export function useRackUsage(rack: Rack): Usage {
  return useSnapshot().stats.slots[rack];
}
