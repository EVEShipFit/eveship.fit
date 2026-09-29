import type { Fit, Violation } from "@eveshipfit/fitting";
import { expect, test } from "vitest";

import {
  countViolations,
  missingSkills,
  violationKind,
  violationText,
} from "../src/components/FittingWindow/violations";

const ship = { type: "ship" } as const;
const item = (index: number) => ({ type: "item", index }) as const;
const charge = (index: number) => ({ type: "charge", index }) as const;

test("each rule is an error, a notice or a missing skill", () => {
  expect(violationKind({ type: "resource", resource: "cpu", used: 2, available: 1 })).toBe("error");
  expect(violationKind({ type: "resource", resource: "cargo_bay", used: 2, available: 1 })).toBe("notice");
  expect(violationKind({ type: "rig_size", ship: 1, item: 2 })).toBe("error");
  expect(violationKind({ type: "skill", type_id: 3300, required: 1, level: 0 })).toBe("skill");
});

test("a missing skill counts once, however many items need it", () => {
  const violations: Violation[] = [
    { target: item(0), rule: { type: "skill", type_id: 3300, required: 1, level: 0 } },
    { target: item(1), rule: { type: "skill", type_id: 3300, required: 2, level: 0 } },
    { target: item(1), rule: { type: "skill", type_id: 3301, required: 1, level: 0 } },
    { target: item(2), rule: { type: "rig_size", ship: 1, item: 2 } },
    { target: item(3), rule: { type: "rig_size", ship: 1, item: 2 } },
    { target: ship, rule: { type: "resource", resource: "drone_bay", used: 5, available: 0 } },
  ];
  expect(countViolations(violations)).toEqual({ skill: 2, error: 2, notice: 1 });
});

const fit: Fit = {
  ship: { type_id: 587 },
  items: [
    { type_id: 2889, slot: { type: "high", index: 0 }, state: "active", charge: { type_id: 185 } },
    { type_id: 31670, slot: { type: "rig", index: 0 }, state: "active" },
  ],
};
const names = { type: (id: number) => `Type ${id}`, group: (id: number) => `Group ${id}` };
const text = (target: Violation["target"], rule: Violation["rule"]) => violationText({ target, rule }, fit, names);

test("a violation says what is wrong, and with what", () => {
  expect(text(ship, { type: "resource", resource: "powergrid", used: 2, available: 1 })).toBe("Powergrid overloaded");
  expect(text(ship, { type: "resource", resource: "launched_drones", used: 6, available: 5 })).toBe(
    "Too many drones launched",
  );
  expect(text(ship, { type: "slots", slot: "high", used: 4, available: 3 })).toBe("Too many high slot modules");
  expect(text(item(1), { type: "rig_size", ship: 1, item: 2 })).toBe("Type 31670: rig size does not match the ship");
  expect(text(item(1), { type: "wrong_slot", expected: "low" })).toBe("Type 31670: goes in a low slot");
  expect(text(item(0), { type: "max_group", group_id: 55, limit: "online", used: 2, allowed: 1 })).toBe(
    "Type 2889: only 1 Group 55 can be online",
  );
  expect(text(item(0), { type: "max_type", type_id: 2889, used: 2, allowed: 1 })).toBe(
    "Type 2889: only 1 can be fitted",
  );
  expect(text(charge(0), { type: "resource", resource: "charge_capacity", used: 2, available: 1 })).toBe(
    "Type 185: too big for Type 2889",
  );
  expect(text(charge(0), { type: "charge_group" })).toBe("Type 185: cannot be loaded in Type 2889");
  expect(text(charge(0), { type: "charge_size", module: 1, charge: 2 })).toBe("Type 185: wrong size for Type 2889");
  expect(text(item(0), { type: "skill", type_id: 3300, required: 4, level: 0 })).toBe("Type 3300 IV");
});

test("a missing skill is listed once, at the highest level asked for", () => {
  const violations: Violation[] = [
    { target: item(0), rule: { type: "skill", type_id: 3300, required: 2, level: 0 } },
    { target: item(1), rule: { type: "skill", type_id: 3300, required: 4, level: 0 } },
    { target: item(1), rule: { type: "skill", type_id: 3301, required: 1, level: 0 } },
  ];
  expect(missingSkills(violations)).toEqual([
    { type: "skill", type_id: 3300, required: 4, level: 0 },
    { type: "skill", type_id: 3301, required: 1, level: 0 },
  ]);
});
