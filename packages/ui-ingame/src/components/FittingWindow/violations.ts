import type { Rule, Violation } from "@eveshipfit/fitting";

/**
 * How EVE warns about a broken rule: `skill` is an orange book, `error` a red triangle for a fit that cannot be
 * flown as it is, `notice` a white one for a fit that flies but might get in trouble.
 */
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

/** A missing skill counts once, however many items need it. */
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
