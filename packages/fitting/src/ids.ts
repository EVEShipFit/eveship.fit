/** Well-known IDs from the SDE; CCP does not renumber these. */

export const Category = {
  Ship: 6,
  Module: 7,
  Charge: 8,
  Skill: 16,
  Drone: 18,
  Implant: 20,
  Subsystem: 32,
  Fighter: 87,
} as const;

export const Effect = {
  LowPower: 11,
  HighPower: 12,
  MediumPower: 13,
  LauncherFitted: 40,
  TurretFitted: 42,
  RigSlot: 2663,
  Subsystem: 3772,
  ServiceSlot: 6306,
} as const;

/** `subSystemSlot` numbers the subsystem slots from here, as EVE's inventory flags do. */
export const FIRST_SUBSYSTEM_FLAG = 125;
