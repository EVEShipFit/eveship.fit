import type { Slot } from "@eveshipfit/dogma-engine";

declare module "@eveshipfit/dogma-engine" {
  interface Fit {
    boosters?: Booster[];
  }
  interface Booster {
    fit: Fit;
    off?: boolean;
  }
}

export type {
  Booster,
  Calculation,
  Character,
  DamageProfile,
  Fit,
  FitItem,
  ItemResult,
  ProjectedBuff,
  Rule,
  Slot,
  State,
  Violation,
} from "@eveshipfit/dogma-engine";

export type SlotType = Slot["type"];

/** The racks a ship has a fixed number of numbered slots in. */
export type Rack = "high" | "medium" | "low" | "rig" | "subsystem" | "service";

/** An item of a fit, as its index into `fit.items`. */
export type ItemRef = number;
