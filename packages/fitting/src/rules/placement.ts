import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { Category, Effect, FIRST_SUBSYSTEM_FLAG } from "../ids.js";
import type { Fit, Rack, SlotType } from "../types.js";
import { baseValue } from "./attributes.js";

export type Placement =
  | { type: Exclude<Rack, "subsystem"> }
  /** Implants, boosters and subsystems each have one slot they go in. */
  | { type: "implant" | "booster" | "subsystem"; index: number }
  | { type: "drone_bay" | "fighter_bay" | "cargo" }
  /** Loaded into a module; `cargo` when no module takes it. */
  | { type: "charge" };

const rackEffects: readonly [number, Exclude<Rack, "subsystem">][] = [
  [Effect.HighPower, "high"],
  [Effect.MediumPower, "medium"],
  [Effect.LowPower, "low"],
  [Effect.RigSlot, "rig"],
  [Effect.ServiceSlot, "service"],
];

/** Where an item of this type goes when fitted; `undefined` for what cannot be part of a fit, like a ship. */
export function placementOf(sde: Sde, type: SdeType): Placement | undefined {
  switch (type.categoryId) {
    case Category.Ship:
      return undefined;
    case Category.Charge:
      return { type: "charge" };
    case Category.Drone:
      return { type: "drone_bay" };
    case Category.Fighter:
      return { type: "fighter_bay" };
    case Category.Subsystem: {
      const flag = baseValue(sde, type, "subSystemSlot");
      return flag === undefined ? undefined : { type: "subsystem", index: flag - FIRST_SUBSYSTEM_FLAG };
    }
    case Category.Implant: {
      const implant = baseValue(sde, type, "implantness");
      if (implant !== undefined) return { type: "implant", index: implant };
      const booster = baseValue(sde, type, "boosterness");
      if (booster !== undefined) return { type: "booster", index: booster };
      return { type: "cargo" };
    }
  }

  for (const [effect, rack] of rackEffects) {
    if (type.effectIds.has(effect)) return { type: rack };
  }
  return { type: "cargo" };
}

/** The lowest slot index in `rack` nothing is fitted in, if below `available`. */
export function firstFreeIndex(fit: Fit, rack: SlotType, available: number): number | undefined {
  const taken = new Set<number>();
  for (const item of fit.items) {
    if (item.slot.type === rack && "index" in item.slot) taken.add(item.slot.index);
  }
  for (let index = 0; index < available; index++) {
    if (!taken.has(index)) return index;
  }
  return undefined;
}
