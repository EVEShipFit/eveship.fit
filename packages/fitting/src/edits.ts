import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { droneRoom } from "./rules/drones.js";
import { firstFreeTube, squadronSize, tubeTakes } from "./rules/fighters.js";
import { acceptsCharge } from "./rules/filters.js";
import { modesOf } from "./rules/modes.js";
import { firstFreeIndex, placementOf } from "./rules/placement.js";
import type { Stats } from "./stats.js";
import type { Fit, FitItem, ItemRef, Slot, SlotType, State } from "./types.js";

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
 * charges in every module that takes them, drones in their bay, and a full
 * squadron of fighters in the first free tube that takes them, else in their bay.
 * With `slot`, only that slot is tried, replacing what is there; the cargo
 * takes anything, and is the only way in for what goes nowhere else.
 */
export function fitType(sde: Sde, fit: Fit, stats: Stats, typeId: number, slot?: Slot): Placed {
  const nowhere = { fit, ref: undefined };
  const type = sde.type(typeId);
  const placement = type && placementOf(sde, type);
  if (type === undefined || placement === undefined) return nowhere;
  if (slot?.type === "cargo") {
    return addToStack(fit, { type_id: typeId, slot: { type: "cargo" }, quantity: 1, state: "offline" });
  }
  const launched = placement.type === "fighter_bay" && slot?.type === "fighter_tube";
  if (slot !== undefined && placement.type !== "charge" && slot.type !== placement.type && !launched) return nowhere;

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
      if (modules.length === 0) return nowhere;

      let loaded = fit;
      for (const { ref } of modules) loaded = setCharge(loaded, ref, typeId);
      return { fit: loaded, ref: modules[0]!.ref };
    }

    case "drone_bay": {
      const state = droneRoom(sde, stats, type) > 0 ? "active" : "offline";
      return addToStack(fit, { type_id: typeId, slot: { type: "drone_bay" }, quantity: 1, state });
    }

    case "fighter_bay": {
      const quantity = squadronSize(sde, type);
      const index = slot === undefined ? firstFreeTube(sde, fit, stats, type) : slotIndex(slot);
      if (index === undefined) {
        return addToStack(fit, { type_id: typeId, slot: { type: "fighter_bay" }, quantity, state: "offline" });
      }
      if (!tubeTakes(sde, fit, stats, type, index)) return nowhere;
      return putInSlot(fit, { type_id: typeId, slot: { type: "fighter_tube", index }, quantity, state: "active" });
    }

    case "cargo":
      return nowhere;
  }
}

const movableRacks: readonly SlotType[] = ["high", "medium", "low", "rig", "service", "fighter_tube"];

/** Move an item to another slot of its rack, swapping places with what is there. */
export function move(fit: Fit, ref: ItemRef, slot: Slot): Fit {
  const item = fit.items[ref];
  if (item === undefined || !movableRacks.includes(item.slot.type)) return fit;
  if (slot.type !== item.slot.type || sameSlot(slot, item.slot)) return fit;

  const other = fit.items.findIndex((existing) => sameSlot(existing.slot, slot));
  let items = fit.items.with(ref, { ...item, slot });
  if (other !== -1) items = items.with(other, { ...fit.items[other]!, slot: item.slot });
  return { ...fit, items };
}

export function remove(fit: Fit, ...refs: ItemRef[]): Fit {
  const items = fit.items.filter((_, ref) => !refs.includes(ref));
  return items.length === fit.items.length ? fit : { ...fit, items };
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

/** Of the drones of a type in the drone bay, make `count` active and the rest offline. */
export function setActiveDrones(fit: Fit, typeId: number, count: number): Fit {
  const { total } = dronesOf(fit, typeId);
  return splitDrones(fit, typeId, total, count);
}

/** How many drones of a type are in the drone bay; new ones are active while there is room, offline ones go first. */
export function setDroneQuantity(sde: Sde, fit: Fit, stats: Stats, typeId: number, quantity: number): Fit {
  const type = sde.type(typeId);
  const { total, active } = dronesOf(fit, typeId);
  if (type === undefined || !Number.isSafeInteger(quantity)) return fit;
  if (quantity <= total) return splitDrones(fit, typeId, quantity, Math.min(active, quantity));
  return splitDrones(fit, typeId, quantity, active + Math.min(quantity - total, droneRoom(sde, stats, type)));
}

function dronesOf(fit: Fit, typeId: number): { refs: ItemRef[]; total: number; active: number } {
  const refs = fit.items.flatMap((item, ref) =>
    item.slot.type === "drone_bay" && item.type_id === typeId ? [ref] : [],
  );
  let total = 0;
  let active = 0;
  for (const ref of refs) {
    const { quantity = 1, state } = fit.items[ref]!;
    total += quantity;
    if (state === "active") active += quantity;
  }
  return { refs, total, active };
}

/** The stacks of a type become one active and one offline stack, where the first one was. */
function splitDrones(fit: Fit, typeId: number, quantity: number, count: number): Fit {
  const before = dronesOf(fit, typeId);
  const total = Math.max(0, quantity);
  const active = Math.max(0, Math.min(count, total));
  if (before.refs.length === 0 || (total === before.total && active === before.active)) return fit;

  const split: FitItem[] = [];
  if (active > 0) split.push({ type_id: typeId, slot: { type: "drone_bay" }, quantity: active, state: "active" });
  if (active < total) {
    split.push({ type_id: typeId, slot: { type: "drone_bay" }, quantity: total - active, state: "offline" });
  }
  const items = fit.items.flatMap((item, ref) => {
    if (ref === before.refs[0]) return split;
    return before.refs.includes(ref) ? [] : [item];
  });
  return { ...fit, items };
}

/** The cargo stacks of a type become one stack of `quantity`, where the first one was. */
export function setCargoQuantity(fit: Fit, typeId: number, quantity: number): Fit {
  return setStackQuantity(fit, "cargo", typeId, quantity);
}

/** The fighter bay stacks of a type become one stack of `quantity`, where the first one was. */
export function setFighterBayQuantity(fit: Fit, typeId: number, quantity: number): Fit {
  return setStackQuantity(fit, "fighter_bay", typeId, quantity);
}

/** How many fighters a squadron in a tube has, up to a full squadron; none removes it. */
export function setSquadronSize(sde: Sde, fit: Fit, ref: ItemRef, size: number): Fit {
  const item = fit.items[ref];
  const type = item && sde.type(item.type_id);
  if (item?.slot.type !== "fighter_tube" || type === undefined || !Number.isSafeInteger(size)) return fit;
  return setQuantity(fit, ref, Math.min(size, squadronSize(sde, type)));
}

function setStackQuantity(fit: Fit, slot: SlotType, typeId: number, quantity: number): Fit {
  const refs = fit.items.flatMap((item, ref) => (item.slot.type === slot && item.type_id === typeId ? [ref] : []));
  const [first, ...rest] = refs;
  if (first === undefined || !Number.isSafeInteger(quantity)) return fit;
  return setQuantity(remove(fit, ...rest), first, quantity);
}

export function setName(fit: Fit, name: string): Fit {
  return fit.name === name ? fit : { ...fit, name };
}

/** Only to a mode of the fit's ship. */
export function setMode(sde: Sde, fit: Fit, modeTypeId: number): Fit {
  if (fit.ship.mode === modeTypeId || !shipModes(sde, fit).some(({ id }) => id === modeTypeId)) return fit;
  return { ...fit, ship: { ...fit.ship, mode: modeTypeId } };
}

/** The fit in a mode of its ship: the one it is in, else the one EVE starts in; in none for a ship without modes. */
export function withMode(sde: Sde, fit: Fit): Fit {
  const modes = shipModes(sde, fit);
  if (modes.some(({ id }) => id === fit.ship.mode)) return fit;
  if (modes[0] !== undefined) return { ...fit, ship: { ...fit.ship, mode: modes[0].id } };
  if (fit.ship.mode === undefined) return fit;
  const { mode: _, ...ship } = fit.ship;
  return { ...fit, ship };
}

function shipModes(sde: Sde, fit: Fit): readonly SdeType[] {
  const ship = sde.type(fit.ship.type_id);
  return ship === undefined ? [] : modesOf(sde, ship);
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

/** Drones, fighters and cargo of the same type and state share a stack. */
function addToStack(fit: Fit, item: FitItem): Placed {
  const ref = fit.items.findIndex(
    (existing) =>
      existing.slot.type === item.slot.type && existing.type_id === item.type_id && existing.state === item.state,
  );
  if (ref === -1) return append(fit, item);
  return { fit: setQuantity(fit, ref, (fit.items[ref]!.quantity ?? 1) + (item.quantity ?? 1)), ref };
}

function slotIndex(slot: Slot): number | undefined {
  return "index" in slot ? slot.index : undefined;
}

function sameSlot(a: Slot, b: Slot): boolean {
  return a.type === b.type && slotIndex(a) === slotIndex(b);
}
