import type { Sde } from "@eveshipfit/sde-loader";

import { allSkills } from "./character.js";
import { baseValues } from "./rules/attributes.js";
import type { Stats } from "./stats.js";
import type { Calculator } from "./store.js";
import type { Character, Fit, ItemRef } from "./types.js";

/** A module with a charge that hands out buffs, like a command burst. */
export interface Burst {
  readonly ref: ItemRef;
  readonly module: number;
  readonly charge: number;
  /** The buffs the charge hands out, as `dbuffCollections` in the SDE numbers them. */
  readonly buffs: readonly number[];
}

/** A buff that landed on the fit. */
export interface Buff {
  /** As `dbuffCollections` in the SDE numbers it. */
  readonly id: number;
  readonly value: number;
  /** The index into `fit.boosters` of the booster it came from; undefined when it came from the fit itself. */
  readonly booster: number | undefined;
  /** The type of the charge that handed it out, when known. */
  readonly charge: number | undefined;
}

export interface BoosterStats {
  /** The booster on its own, flown with every skill at V. */
  readonly stats: Stats;
  readonly bursts: readonly Burst[];
  /** Whether it hands out any buff, as `stats.calculation.outgoing` lists them. */
  readonly handsOut: boolean;
  /** Whether a buff it hands out landed; false when it is off, or others hand out stronger ones. */
  readonly landed: boolean;
}

export interface Boosts {
  /** Whether the fit's boosters apply at all; see `FitStore.setBoostersOn`. */
  readonly on: boolean;
  /** The buffs that landed, ordered by ID. */
  readonly buffs: readonly Buff[];
  /** Index-parallel to `fit.boosters`. */
  readonly boosters: readonly BoosterStats[];
}

const buffAttributes = ["warfareBuff1ID", "warfareBuff2ID", "warfareBuff3ID", "warfareBuff4ID"] as const;

/** The modules of a fit loaded with a charge that hands out buffs. */
export function burstsOf(sde: Sde, fit: Fit): Burst[] {
  const bursts: Burst[] = [];
  for (const [ref, item] of fit.items.entries()) {
    if (item.charge === undefined || item.slot.type === "cargo") continue;
    const charge = sde.type(item.charge.type_id);
    const buffs = charge ? baseValues(sde, charge, buffAttributes).filter((id) => id > 0) : [];
    if (buffs.length > 0) bursts.push({ ref, module: item.type_id, charge: item.charge.type_id, buffs });
  }
  return bursts;
}

/** Whether `fit` has a booster that is not off. */
export function hasBoosters(fit: Fit): boolean {
  return fit.boosters?.some((booster) => !booster.off) ?? false;
}

const levelFive = new WeakMap<Sde, Character>();
const calculated = new WeakMap<Calculator, WeakMap<Fit, Stats>>();

/** Where each buff that landed in `stats` came from. */
export function boostsOf(calculator: Calculator, fit: Fit, stats: Stats, on: boolean): Boosts {
  const { sde } = calculator;
  let character = levelFive.get(sde);
  if (character === undefined) levelFive.set(sde, (character = allSkills(sde, 5)));
  let cache = calculated.get(calculator);
  if (cache === undefined) calculated.set(calculator, (cache = new WeakMap()));

  const boosters = (fit.boosters ?? []).map((booster) => {
    let boosterStats = cache.get(booster.fit);
    if (boosterStats === undefined)
      cache.set(booster.fit, (boosterStats = calculator.calculate(booster.fit, character)));
    return { booster, stats: boosterStats, bursts: burstsOf(sde, booster.fit) };
  });
  const own = burstsOf(sde, fit);

  const buffs = (stats.calculation.buffs ?? []).map(({ id, value }): Buff => {
    const index = boosters.findIndex(
      ({ booster, stats: boosterStats }) => on && !booster.off && hands(boosterStats, id, value),
    );
    const bursts = index === -1 ? own : boosters[index]!.bursts;
    const charge = bursts.find((burst) => burst.buffs.includes(id))?.charge;
    return { id, value, booster: index === -1 ? undefined : index, charge };
  });

  return {
    on,
    buffs,
    boosters: boosters.map(({ booster, stats: boosterStats, bursts }) => ({
      stats: boosterStats,
      bursts,
      handsOut: (boosterStats.calculation.outgoing?.buffs ?? []).length > 0,
      landed: on && !booster.off && buffs.some((buff) => hands(boosterStats, buff.id, buff.value)),
    })),
  };
}

function hands(stats: Stats, id: number, value: number): boolean {
  return (stats.calculation.outgoing?.buffs ?? []).some(
    (buff) => buff.id === id && Math.abs(buff.value - value) <= 1e-9 * Math.max(1, Math.abs(value)),
  );
}
