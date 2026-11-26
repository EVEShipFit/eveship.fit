import type { Burst, Fit } from "@eveshipfit/fitting";
import type { SdeBuff } from "@eveshipfit/sde-loader";

import { formatNumber } from "../format.js";
import { useFitStore, useShownSnapshot } from "./fit.js";
import { useSde } from "./sde.js";

/**
 * - `on`: a buff it hands out landed.
 * - `off`: it is switched off, or all boosters are.
 * - `overridden`: other boosters hand out the same buffs, stronger.
 * - `idle`: it hands out no buffs.
 */
export type FleetBoosterStatus = "on" | "off" | "overridden" | "idle";

export interface FleetBooster {
  readonly fit: Fit;
  readonly off: boolean;
  readonly bursts: readonly Burst[];
  readonly status: FleetBoosterStatus;
}

export interface LandedBuff {
  readonly id: number;
  readonly value: number;
  readonly name: string;
  /** The value as EVE shows it, like "+25.9 %"; empty for a buff EVE shows no value of. */
  readonly effect: string;
  /** The index into `boosters` of the booster it came from; undefined when it came from the fit itself. */
  readonly booster: number | undefined;
  /** The type of the charge that handed it out, when known. */
  readonly charge: number | undefined;
}

export interface FleetControls {
  /** The fits boosting this one, in the order they were added. */
  readonly boosters: readonly FleetBooster[];
  /** The buffs that landed on the fit, following the preview. */
  readonly buffs: readonly LandedBuff[];
  /** Whether the boosters apply at all. */
  readonly on: boolean;
  readonly add: (fit: Fit) => void;
  readonly remove: (index: number) => void;
  readonly setOff: (index: number, off: boolean) => void;
  readonly setOn: (on: boolean) => void;
}

/** The fleet boosting the fit; throws while the store has no fit. */
export function useFleet(): FleetControls {
  const sde = useSde();
  const store = useFitStore();
  const { fit, boosts } = useShownSnapshot();

  return {
    boosters: (fit.boosters ?? []).map((booster, index) => {
      const { bursts, landed } = boosts.boosters[index] ?? { bursts: [], landed: false };
      const off = booster.off ?? false;
      const status = landed ? "on" : off || !boosts.on ? "off" : bursts.length === 0 ? "idle" : "overridden";
      return { fit: booster.fit, off, bursts, status };
    }),
    buffs: boosts.buffs.map((buff) => {
      const known = sde.buff(buff.id);
      return { ...buff, name: known?.name ?? `Buff ${buff.id}`, effect: buffEffect(known, buff.value) };
    }),
    on: boosts.on,
    add: (booster) => store.addBooster(booster),
    remove: (index) => store.removeBooster(index),
    setOff: (index, off) => store.setBoosterOff(index, off),
    setOn: (on) => store.setBoosts(on),
  };
}

function buffEffect(buff: SdeBuff | undefined, value: number): string {
  if (buff === undefined || buff.display === "hidden") return "";
  const shown = buff.display === "inverted" ? -value : value;
  const change = buff.operation === "post_mul" ? (shown - 1) * 100 : shown;
  const sign = change > 0 ? "+" : "";
  const unit = buff.operation === "post_percent" || buff.operation === "post_mul" ? " %" : "";
  return `${sign}${formatNumber(change, { decimals: 1 })}${unit}`;
}
