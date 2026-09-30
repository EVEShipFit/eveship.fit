import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { Category } from "../ids.js";
import { baseValue, baseValues } from "./attributes.js";
import { fighterKind, isStandupFighter, kindTubes } from "./fighters.js";
import { placementOf } from "./placement.js";

const chargeGroups = ["chargeGroup1", "chargeGroup2", "chargeGroup3", "chargeGroup4", "chargeGroup5"];
const shipGroups = Array.from({ length: 20 }, (_, i) => `canFitShipGroup${String(i + 1).padStart(2, "0")}`);
const shipTypes = Array.from({ length: 12 }, (_, i) => `canFitShipType${i + 1}`);
const racks = new Set(["high", "medium", "low", "rig", "subsystem", "service"]);

const CAPITAL_VOLUME = 3500;

/** Whether `module` can load `charge`: the right group, the right size, and room for at least one. */
export function acceptsCharge(sde: Sde, module: SdeType, charge: SdeType): boolean {
  if (charge.categoryId !== Category.Charge) return false;
  if (!baseValues(sde, module, chargeGroups).includes(charge.groupId)) return false;

  const size = baseValue(sde, module, "chargeSize");
  if (size !== undefined && baseValue(sde, charge, "chargeSize") !== size) return false;

  return (charge.volume ?? 0) <= (module.capacity ?? 0);
}

/** Every published charge `module` can load, sorted by name. */
export function chargesFor(sde: Sde, module: SdeType): SdeType[] {
  const groups = new Set(baseValues(sde, module, chargeGroups));
  if (groups.size === 0) return [];

  const charges: SdeType[] = [];
  for (const type of sde.types()) {
    if (type.published && groups.has(type.groupId) && acceptsCharge(sde, module, type)) charges.push(type);
  }
  return charges.toSorted((a, b) => a.name.localeCompare(b.name));
}

/** Whether `type` may go on `ship` at all, however the rest of the fit looks. */
export function canFit(sde: Sde, type: SdeType, ship: SdeType): boolean {
  const groups = baseValues(sde, type, shipGroups);
  const types = baseValues(sde, type, shipTypes);
  if ((groups.length > 0 || types.length > 0) && !groups.includes(ship.groupId) && !types.includes(ship.id)) {
    return false;
  }

  const rigSize = baseValue(sde, type, "rigSize");
  if (rigSize !== undefined && rigSize !== baseValue(sde, ship, "rigSize")) return false;

  const hull = baseValue(sde, type, "fitsToShipType");
  if (hull !== undefined && hull !== ship.id) return false;

  const placement = placementOf(sde, type)?.type;
  const fitted = placement !== undefined && racks.has(placement);
  const fighter = placement === "fighter_bay";
  const structure = ship.categoryId === Category.Structure;

  const capital = fitted && placement !== "rig" && (type.volume ?? 0) > CAPITAL_VOLUME;
  if (capital && !structure && !baseValue(sde, ship, "isCapitalSize")) return false;

  if (fighter) {
    const kind = fighterKind(sde, type);
    if (kind !== undefined && !baseValue(sde, ship, kindTubes[kind][structure ? "structure" : "ship"])) return false;
  }

  if (fitted || fighter) {
    const standup = type.categoryId === Category.StructureModule || isStandupFighter(sde, type);
    if (standup !== structure) return false;
  }
  return true;
}
