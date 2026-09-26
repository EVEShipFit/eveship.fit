import { expect, test } from "vitest";

import { rackSize, slotAngle, type WheelRack } from "../src/primitives/Wheel/layout";

const racks: WheelRack[] = ["high", "medium", "low", "rig", "subsystem"];

function angles(rack: WheelRack): number[] {
  return Array.from({ length: rackSize(rack) }, (_, index) => slotAngle(rack, index));
}

test("the high, medium and low racks sit around the top, right and bottom", () => {
  for (const [rack, centre] of [
    ["high", 0],
    ["medium", 90],
    ["low", 180],
  ] as const) {
    const all = angles(rack);
    expect(Math.abs((all[0]! + all.at(-1)!) / 2 - centre)).toBeLessThan(1.5);
  }
});

test("no two slots overlap", () => {
  const all = racks.flatMap(angles).map((angle) => (angle + 360) % 360);
  all.sort((a, b) => a - b);
  const gaps = all.map((angle, index) => (all[(index + 1) % all.length]! - angle + 360) % 360);
  // A slot's frame is about 8.4° wide, at its outer edge.
  expect(Math.min(...gaps)).toBeGreaterThanOrEqual(8.4);
});
