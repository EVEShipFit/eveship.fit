import type { Violation } from "@eveshipfit/fitting";
import { expect, test } from "vitest";

import { countViolations, violationKind } from "../src/components/FittingWindow/violations";

const ship = { type: "ship" } as const;
const item = (index: number) => ({ type: "item", index }) as const;

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
