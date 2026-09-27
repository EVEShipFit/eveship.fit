import type { Fit, FitItem, ItemRef, ItemStats, Rack, Stats, Usage } from "@eveshipfit/fitting";

import { useShownSnapshot, useSnapshot, useStats } from "./fit.js";

export interface SlotContent {
  readonly index: number;
  /** Absent for an empty slot, and for one only the preview fills. */
  readonly ref: ItemRef | undefined;
  readonly item: FitItem | undefined;
  readonly stats: ItemStats | undefined;
  /** Filled by the preview, not by the fit. */
  readonly preview: boolean;
}

/**
 * Every slot of a rack, empty ones included; follows the preview, like
 * `useStats`. Items in slots the ship does not have (after swapping a
 * subsystem, say) are listed after the real ones.
 */
export function useSlots(rack: Rack): readonly SlotContent[] {
  const current = useSnapshot();
  const shown = useShownSnapshot();

  const refs = refsByIndex(current.fit, rack);
  const shownRefs = refsByIndex(shown.fit, rack);

  const count = Math.max(shown.stats.slots[rack].total, ...Array.from(shownRefs.keys(), (index) => index + 1));
  return Array.from({ length: count }, (_, index) => {
    const ref = refs.get(index);
    const shownRef = shownRefs.get(index);
    const item = shownRef === undefined ? undefined : shown.fit.items[shownRef];
    const preview = item !== undefined && item !== (ref === undefined ? undefined : current.fit.items[ref]);
    return {
      index,
      ref: item === undefined || preview ? undefined : ref,
      item,
      stats: shownRef === undefined ? undefined : shown.stats.items[shownRef],
      preview,
    };
  });
}

/** Follows the preview, like `useStats`. */
export function useHardpoints(): Stats["hardpoints"] {
  return useStats().hardpoints;
}

/** Follows the preview, like `useStats`. */
export function useRackUsage(rack: Rack): Usage {
  return useStats().slots[rack];
}

/** In m³; follows the preview, like `useStats`. */
export function useBayUsage(bay: "cargo" | "droneBay"): Usage {
  return useStats()[bay];
}

function refsByIndex(fit: Fit, rack: Rack): Map<number, ItemRef> {
  const refs = new Map<number, ItemRef>();
  fit.items.forEach((item, ref) => {
    if (item.slot.type === rack) refs.set(item.slot.index, ref);
  });
  return refs;
}
