import type { Fit, FitItem, ItemRef, ItemStats, Rack, SlotType, Stats, Usage } from "@eveshipfit/fitting";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { useFit, useShownSnapshot, useSnapshot, useStats } from "./fit.js";
import { useSde } from "./sde.js";

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

export interface BayContent {
  readonly type: SdeType;
  readonly quantity: number;
  /** How many of `quantity` are active, like launched drones. */
  readonly active: number;
  readonly refs: readonly ItemRef[];
}

const baySlots: Record<"cargo" | "droneBay", SlotType> = { cargo: "cargo", droneBay: "drone_bay" };

/** What is in a bay, one entry per type, by name; does not follow the preview. */
export function useBayContents(bay: "cargo" | "droneBay"): readonly BayContent[] {
  const sde = useSde();
  const fit = useFit();

  return useMemo(() => {
    const byType = new Map<number, { type: SdeType; quantity: number; active: number; refs: ItemRef[] }>();
    fit.items.forEach((item, ref) => {
      const type = sde.type(item.type_id);
      if (item.slot.type !== baySlots[bay] || type === undefined) return;
      const content = byType.get(type.id) ?? { type, quantity: 0, active: 0, refs: [] };
      content.quantity += item.quantity ?? 1;
      if (item.state === "active") content.active += item.quantity ?? 1;
      content.refs.push(ref);
      byType.set(type.id, content);
    });
    return [...byType.values()].toSorted((a, b) => a.type.name.localeCompare(b.type.name));
  }, [sde, fit, bay]);
}

function refsByIndex(fit: Fit, rack: Rack): Map<number, ItemRef> {
  const refs = new Map<number, ItemRef>();
  fit.items.forEach((item, ref) => {
    if (item.slot.type === rack) refs.set(item.slot.index, ref);
  });
  return refs;
}
