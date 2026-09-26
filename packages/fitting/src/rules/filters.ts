import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { Category } from "../ids.js";
import { baseValue, baseValues } from "./attributes.js";

const chargeGroups = ["chargeGroup1", "chargeGroup2", "chargeGroup3", "chargeGroup4", "chargeGroup5"];
const shipGroups = Array.from({ length: 20 }, (_, i) => `canFitShipGroup${String(i + 1).padStart(2, "0")}`);
const shipTypes = Array.from({ length: 12 }, (_, i) => `canFitShipType${i + 1}`);

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

/**
 * Whether `type` may go on `ship` at all: hull restrictions, rig size and
 * subsystems of the right hull. Whether there is room left is the
 * calculation's job, as that depends on the rest of the fit.
 */
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

  return true;
}
