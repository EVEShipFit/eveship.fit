import type { Sde } from "@eveshipfit/sde-loader";

import { Category, Effect } from "./ids.js";
import type { Calculation, Fit, ItemResult, Rack, State, Violation } from "./types.js";

export interface Usage {
  readonly used: number;
  readonly total: number;
}

/** Calculated attributes of one thing in the fit, by name or by ID. */
export class Attributes {
  readonly #sde: Sde;
  readonly #result: ItemResult;

  constructor(sde: Sde, result: ItemResult) {
    this.#sde = sde;
    this.#result = result;
  }

  /** The value after every effect applied. */
  get(attribute: string | number): number | undefined {
    return this.#find(attribute)?.value;
  }

  /** The value before any effect applied. */
  base(attribute: string | number): number | undefined {
    return this.#find(attribute)?.base;
  }

  #find(attribute: string | number) {
    const id = typeof attribute === "number" ? attribute : this.#sde.attributeId(attribute);
    return id === undefined ? undefined : this.#result.attributes.get(id);
  }
}

export interface ItemStats {
  /** The state reached, which can be lower than the one asked for. */
  readonly state: State;
  readonly maxState: State;
  readonly attributes: Attributes;
  readonly charge: Attributes | undefined;
}

const rackAttributes: Record<Rack, string> = {
  high: "hiSlots",
  medium: "medSlots",
  low: "lowSlots",
  rig: "rigSlots",
  subsystem: "maxSubSystems",
  service: "serviceSlots",
};

/** A calculation of a fit, with named access and the totals a fitting window shows. */
export class Stats {
  readonly calculation: Calculation;
  readonly ship: Attributes;
  readonly character: Attributes;
  readonly mode: Attributes | undefined;
  /** Index-parallel to `fit.items`. */
  readonly items: readonly ItemStats[];
  /** Every fitting rule the fit breaks; empty when it can be flown as is. */
  readonly violations: readonly Violation[];
  readonly slots: Readonly<Record<Rack, Usage>>;
  readonly hardpoints: { readonly turret: Usage; readonly launcher: Usage };
  /** In m³. */
  readonly cargo: Usage;
  /** In m³. */
  readonly droneBay: Usage;
  /** In m³. */
  readonly fighterBay: Usage;
  /** An Upwell structure. */
  readonly structure: boolean;
  /** Fuel blocks an hour the online service modules use. */
  readonly fuel: number;

  constructor(sde: Sde, fit: Fit, calculation: Calculation) {
    this.calculation = calculation;
    this.ship = new Attributes(sde, calculation.ship);
    this.character = new Attributes(sde, calculation.character);
    this.mode = calculation.mode && new Attributes(sde, calculation.mode);
    this.items = calculation.items.map((item) => ({
      state: item.state,
      maxState: item.max_state,
      attributes: new Attributes(sde, item),
      charge: item.charge && new Attributes(sde, item.charge),
    }));
    this.structure = sde.type(fit.ship.type_id)?.categoryId === Category.Structure;
    this.violations = (calculation.violations ?? []).filter(
      ({ rule }) => !(this.structure && rule.type === "resource" && rule.resource === "cargo_bay"),
    );

    const used = {
      high: 0,
      medium: 0,
      low: 0,
      rig: 0,
      subsystem: 0,
      service: 0,
      turret: 0,
      launcher: 0,
      cargo: 0,
      droneBay: 0,
      fighterBay: 0,
    };
    let fuel = 0;
    for (const [index, item] of fit.items.entries()) {
      const type = sde.type(item.type_id);
      switch (item.slot.type) {
        case "high":
          used.high += 1;
          if (type?.effectIds.has(Effect.TurretFitted)) used.turret += 1;
          if (type?.effectIds.has(Effect.LauncherFitted)) used.launcher += 1;
          break;
        case "medium":
        case "low":
        case "rig":
        case "subsystem":
          used[item.slot.type] += 1;
          break;
        case "service": {
          used.service += 1;
          const stats = this.items[index];
          if (stats !== undefined && stats.state !== "offline")
            fuel += stats.attributes.get("serviceModuleFuelAmount") ?? 0;
          break;
        }
        case "cargo":
          used.cargo += (type?.volume ?? 0) * (item.quantity ?? 1);
          break;
        case "drone_bay":
          used.droneBay += (type?.volume ?? 0) * (item.quantity ?? 1);
          break;
        case "fighter_bay":
          used.fighterBay += (type?.volume ?? 0) * (item.quantity ?? 1);
          break;
        case "fighter_tube":
        case "implant":
        case "booster":
          break;
      }
    }

    const total = (attribute: string) => this.ship.get(attribute) ?? 0;
    const usage = (rack: Rack): Usage => ({ used: used[rack], total: total(rackAttributes[rack]) });
    this.slots = {
      high: usage("high"),
      medium: usage("medium"),
      low: usage("low"),
      rig: usage("rig"),
      subsystem: usage("subsystem"),
      service: usage("service"),
    };
    this.hardpoints = {
      turret: { used: used.turret, total: total("turretSlotsLeft") },
      launcher: { used: used.launcher, total: total("launcherSlotsLeft") },
    };
    this.cargo = { used: used.cargo, total: total("capacity") };
    this.droneBay = { used: used.droneBay, total: total("droneCapacity") };
    this.fighterBay = { used: used.fighterBay, total: total("fighterCapacity") };
    this.fuel = fuel;
  }
}
