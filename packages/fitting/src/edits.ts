import type { Sde } from "@eveshipfit/sde-loader";

import { baseValue } from "./rules/attributes.js";
import { acceptsCharge } from "./rules/filters.js";
import { firstFreeIndex, placementOf } from "./rules/placement.js";
import type { Stats } from "./stats.js";
import type { Fit, FitItem, ItemRef, Slot, State } from "./types.js";

// Edits never change the fit they are given; when nothing changes, they return that same fit.

export interface Placed {
  readonly fit: Fit;
  /** Where the item ended up; `undefined` when it did not fit. */
  readonly ref: ItemRef | undefined;
}

export function emptyFit(shipTypeId: number): Fit {
  return { ship: { type_id: shipTypeId }, items: [] };
}

/**
 * Put a type where EVE would: modules in the first free slot of their rack,
 * charges in every module that takes them, drones and fighters in their bay,
 * anything else in the cargo. With `slot`, only that slot is tried, replacing
 * what is there.
 */
export function fitType(sde: Sde, fit: Fit, stats: Stats, typeId: number, slot?: Slot): Placed {
  const nowhere = { fit, ref: undefined };
  const type = sde.type(typeId);
  const placement = type && placementOf(sde, type);
  if (type === undefined || placement === undefined) return nowhere;
  if (slot !== undefined && placement.type !== "charge" && slot.type !== placement.type) return nowhere;

  switch (placement.type) {
    case "high":
    case "medium":
    case "low":
    case "rig":
    case "service": {
      const index =
        slot === undefined ? firstFreeIndex(fit, placement.type, stats.slots[placement.type].total) : slotIndex(slot);
      if (index === undefined) return nowhere;
      return putInSlot(fit, { type_id: typeId, slot: { type: placement.type, index }, state: "active" });
    }

    case "subsystem":
    case "implant":
    case "booster":
      if (slot !== undefined && !sameSlot(slot, placement)) return nowhere;
      return putInSlot(fit, { type_id: typeId, slot: placement, state: "active" });

    case "charge": {
      const modules = fit.items
        .map((item, ref) => ({ item, ref }))
        .filter(({ item }) => slot === undefined || sameSlot(item.slot, slot))
        .filter(({ item }) => {
          const module = sde.type(item.type_id);
          return module !== undefined && acceptsCharge(sde, module, type);
        });
      if (modules.length === 0) {
        if (slot !== undefined) return nowhere;
        return addToStack(fit, { type_id: typeId, slot: { type: "cargo" }, quantity: 1, state: "offline" });
      }

      let loaded = fit;
      for (const { ref } of modules) loaded = setCharge(loaded, ref, typeId);
      return { fit: loaded, ref: modules[0]!.ref };
    }

    case "drone_bay":
      return addToStack(fit, { type_id: typeId, slot: { type: "drone_bay" }, quantity: 1, state: "active" });

    case "fighter_bay": {
      const quantity = baseValue(sde, type, "fighterSquadronMaxSize") ?? 1;
      return append(fit, { type_id: typeId, slot: { type: "fighter_bay" }, quantity, state: "offline" });
    }

    case "cargo":
      return addToStack(fit, { type_id: typeId, slot: { type: "cargo" }, quantity: 1, state: "offline" });
  }
}

export function remove(fit: Fit, ref: ItemRef): Fit {
  if (fit.items[ref] === undefined) return fit;
  return { ...fit, items: fit.items.toSpliced(ref, 1) };
}

export function setState(fit: Fit, ref: ItemRef, state: State): Fit {
  return update(fit, ref, (item) => (item.state === state ? item : { ...item, state }));
}

export function setCharge(fit: Fit, ref: ItemRef, chargeTypeId: number | undefined): Fit {
  return update(fit, ref, (item) => {
    if (item.charge?.type_id === chargeTypeId) return item;
    if (chargeTypeId !== undefined) return { ...item, charge: { type_id: chargeTypeId } };
    const { charge: _, ...unloaded } = item;
    return unloaded;
  });
}

/** A quantity of zero removes the item. */
export function setQuantity(fit: Fit, ref: ItemRef, quantity: number): Fit {
  if (quantity <= 0) return remove(fit, ref);
  return update(fit, ref, (item) => ((item.quantity ?? 1) === quantity ? item : { ...item, quantity }));
}

export function setName(fit: Fit, name: string): Fit {
  return fit.name === name ? fit : { ...fit, name };
}

function update(fit: Fit, ref: ItemRef, change: (item: FitItem) => FitItem): Fit {
  const item = fit.items[ref];
  if (item === undefined) return fit;
  const changed = change(item);
  return changed === item ? fit : { ...fit, items: fit.items.with(ref, changed) };
}

function append(fit: Fit, item: FitItem): Placed {
  return { fit: { ...fit, items: [...fit.items, item] }, ref: fit.items.length };
}

function putInSlot(fit: Fit, item: FitItem): Placed {
  const ref = fit.items.findIndex((existing) => sameSlot(existing.slot, item.slot));
  if (ref === -1) return append(fit, item);
  return { fit: { ...fit, items: fit.items.with(ref, item) }, ref };
}

/** Drones and cargo of the same type and state share a stack. */
function addToStack(fit: Fit, item: FitItem): Placed {
  const ref = fit.items.findIndex(
    (existing) =>
      existing.slot.type === item.slot.type && existing.type_id === item.type_id && existing.state === item.state,
  );
  if (ref === -1) return append(fit, item);
  return { fit: setQuantity(fit, ref, (fit.items[ref]!.quantity ?? 1) + 1), ref };
}

function slotIndex(slot: Slot): number | undefined {
  return "index" in slot ? slot.index : undefined;
}

function sameSlot(a: Slot, b: Slot): boolean {
  return a.type === b.type && slotIndex(a) === slotIndex(b);
}
