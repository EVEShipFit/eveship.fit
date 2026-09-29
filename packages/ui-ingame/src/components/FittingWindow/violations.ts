import type { Fit, Rule, Violation } from "@eveshipfit/fitting";

/** `error` is a red triangle, `notice` a white one: it flies, but may get in trouble; `skill` an orange book. */
export type ViolationKind = "skill" | "error" | "notice";

type Resource = Extract<Rule, { type: "resource" }>["resource"];

const byRule: Record<Exclude<Rule["type"], "resource">, ViolationKind> = {
  skill: "skill",
  slots: "error",
  wrong_slot: "error",
  slot_taken: "error",
  wrong_slot_index: "error",
  subsystem_taken: "error",
  rig_size: "error",
  ship_restricted: "error",
  capital_item: "error",
  structure_item: "error",
  ship_item: "error",
  max_group: "error",
  max_type: "error",
  charge_group: "error",
  charge_size: "error",
};

const byResource: Record<Resource, ViolationKind> = {
  cpu: "error",
  powergrid: "error",
  calibration: "error",
  charge_capacity: "error",
  cargo_bay: "notice",
  drone_bay: "notice",
  drone_bandwidth: "notice",
  launched_drones: "notice",
  fighter_bay: "notice",
  fighter_tubes: "notice",
  light_fighter_tubes: "notice",
  support_fighter_tubes: "notice",
  heavy_fighter_tubes: "notice",
};

export function violationKind(rule: Rule): ViolationKind {
  return rule.type === "resource" ? byResource[rule.resource] : byRule[rule.type];
}

/** Each missing skill counts once. */
export function countViolations(violations: readonly Violation[]): Record<ViolationKind, number> {
  const skills = new Set<number>();
  const counts: Record<ViolationKind, number> = { skill: 0, error: 0, notice: 0 };
  for (const { rule } of violations) {
    if (rule.type === "skill") skills.add(rule.type_id);
    else counts[violationKind(rule)] += 1;
  }
  counts.skill = skills.size;
  return counts;
}

export interface Names {
  type(id: number): string;
  group(id: number): string;
}

const resourceTexts: Record<Exclude<Resource, "charge_capacity">, string> = {
  cpu: "CPU overloaded",
  powergrid: "Powergrid overloaded",
  calibration: "Calibration overloaded",
  cargo_bay: "Cargo hold overloaded",
  drone_bay: "Drone bay overloaded",
  drone_bandwidth: "Drone bandwidth overloaded",
  fighter_bay: "Fighter bay overloaded",
  launched_drones: "Too many drones launched",
  fighter_tubes: "Too many fighters launched",
  light_fighter_tubes: "Too many light fighters launched",
  support_fighter_tubes: "Too many support fighters launched",
  heavy_fighter_tubes: "Too many heavy fighters launched",
};

type SlotKind = Extract<Rule, { type: "slots" }>["slot"];

const rackItems: Record<SlotKind, string> = {
  high: "high slot modules",
  medium: "medium slot modules",
  low: "low slot modules",
  rig: "rigs",
  subsystem: "subsystems",
  service: "service modules",
  turret: "turrets",
  launcher: "launchers",
};

const slotNames: Record<SlotKind, string> = {
  high: "a high slot",
  medium: "a medium slot",
  low: "a low slot",
  rig: "a rig slot",
  subsystem: "a subsystem slot",
  service: "a service slot",
  turret: "a turret hardpoint",
  launcher: "a launcher hardpoint",
};

const romanLevels = ["I", "II", "III", "IV", "V"];

/** What is wrong, or the skill that is missing. */
export function violationText({ target, rule }: Violation, fit: Fit, names: Names): string {
  const item = target.type === "ship" ? undefined : fit.items[target.index];
  const module = item ? names.type(item.type_id) : "";
  const charge = item?.charge ? names.type(item.charge.type_id) : "";
  const subject = target.type === "charge" ? charge : module;

  switch (rule.type) {
    case "resource":
      return rule.resource === "charge_capacity" ? `${charge}: too big for ${module}` : resourceTexts[rule.resource];
    case "slots":
      return `Too many ${rackItems[rule.slot]}`;
    case "skill":
      return `${names.type(rule.type_id)} ${romanLevels[rule.required - 1]}`;
    case "wrong_slot":
      return `${subject}: goes in ${slotNames[rule.expected]}`;
    case "slot_taken":
      return `${subject}: slot already taken`;
    case "wrong_slot_index":
      return `${subject}: goes in ${item?.slot.type} slot ${rule.expected}`;
    case "subsystem_taken":
      return `${subject}: another subsystem covers the same part of the ship`;
    case "rig_size":
      return `${subject}: rig size does not match the ship`;
    case "ship_restricted":
      return `${subject}: cannot be fitted to this ship`;
    case "capital_item":
      return `${subject}: needs a capital ship`;
    case "structure_item":
      return `${subject}: only fits on a structure`;
    case "ship_item":
      return `${subject}: does not fit on a structure`;
    case "max_group":
      return `${subject}: only ${rule.allowed} ${names.group(rule.group_id)} can be ${rule.limit}`;
    case "max_type":
      return `${subject}: only ${rule.allowed} can be fitted`;
    case "charge_group":
      return `${charge}: cannot be loaded in ${module}`;
    case "charge_size":
      return `${charge}: wrong size for ${module}`;
  }
}

type SkillRule = Extract<Rule, { type: "skill" }>;

/** Each missing skill once, at the highest level asked for. */
export function missingSkills(violations: readonly Violation[]): SkillRule[] {
  const skills = new Map<number, SkillRule>();
  for (const { rule } of violations) {
    if (rule.type === "skill" && rule.required > (skills.get(rule.type_id)?.required ?? 0)) {
      skills.set(rule.type_id, rule);
    }
  }
  return [...skills.values()];
}
