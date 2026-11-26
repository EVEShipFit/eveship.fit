import type { Sde } from "@eveshipfit/sde-loader";

import { baseValues } from "./rules/attributes.js";
import type { Stats } from "./stats.js";
import type { Fit, ItemRef } from "./types.js";

/** A module with a charge that hands out buffs, like a command burst. */
export interface Burst {
  readonly ref: ItemRef;
  readonly module: number;
  readonly charge: number;
  /** The buffs the charge hands out, as `dbuffCollections` in the SDE numbers them. */
  readonly buffs: readonly number[];
  /** Whether the module is active or overheated; only then does it hand out its buffs. */
  readonly active: boolean;
}

/** A buff that landed on the fit. */
export interface Buff {
  /** As `dbuffCollections` in the SDE numbers it. */
  readonly id: number;
  readonly value: number;
  /** The index into `fit.boosters` of the booster it came from; undefined when it came from the fit itself, or from `incoming`. */
  readonly booster: number | undefined;
  /** The type of the charge that handed it out, when known. */
  readonly charge: number | undefined;
}

export interface BoosterState {
  readonly bursts: readonly Burst[];
  /** Whether a buff it hands out landed; false when it is off, or others hand out the same buffs, as strong or stronger. */
  readonly landed: boolean;
}

export interface Boosts {
  /** Whether the fit's boosters apply at all; see `FitStore.setBoostersOn`. */
  readonly on: boolean;
  /** The buffs that landed, ordered by ID. */
  readonly buffs: readonly Buff[];
  /** Index-parallel to `fit.boosters`. */
  readonly boosters: readonly BoosterState[];
}

const buffAttributes = ["warfareBuff1ID", "warfareBuff2ID", "warfareBuff3ID", "warfareBuff4ID"] as const;

/** The modules of a fit loaded with a charge that hands out buffs. */
export function burstsOf(sde: Sde, fit: Fit): Burst[] {
  const bursts: Burst[] = [];
  for (const [ref, item] of fit.items.entries()) {
    if (item.charge === undefined || item.slot.type === "cargo") continue;
    const charge = sde.type(item.charge.type_id);
    const buffs = charge ? baseValues(sde, charge, buffAttributes).filter((id) => id > 0) : [];
    if (buffs.length === 0) continue;
    const active = item.state === "active" || item.state === "overload";
    bursts.push({ ref, module: item.type_id, charge: item.charge.type_id, buffs, active });
  }
  return bursts;
}

/** Whether `fit` has a booster that is not off. */
export function hasBoosters(fit: Fit): boolean {
  return fit.boosters?.some((booster) => !booster.off) ?? false;
}

/** The buffs that landed in `stats`, with the charge that sent each. */
export function boostsOf(sde: Sde, fit: Fit, stats: Stats, on: boolean): Boosts {
  const boosterBursts = (fit.boosters ?? []).map((booster) => burstsOf(sde, booster.fit));
  const own = burstsOf(sde, fit);

  const buffs = (stats.calculation.buffs ?? []).map(({ id, value, booster }): Buff => {
    const bursts = (booster === undefined ? own : boosterBursts[booster]) ?? [];
    const charge = bursts.find((burst) => burst.active && burst.buffs.includes(id))?.charge;
    return { id, value, booster, charge };
  });

  return {
    on,
    buffs,
    boosters: boosterBursts.map((bursts, index) => ({
      bursts,
      landed: buffs.some((buff) => buff.booster === index),
    })),
  };
}
