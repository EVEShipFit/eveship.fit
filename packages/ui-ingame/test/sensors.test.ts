import { expect, test } from "vitest";

import { strongestSensor } from "../src/components/ShipStatistics/sensors";

function strengths(amarr?: number, caldari?: number, gallente?: number, minmatar?: number) {
  return {
    amarr: { value: amarr },
    caldari: { value: caldari },
    gallente: { value: gallente },
    minmatar: { value: minmatar },
  };
}

test("the strongest sensor is shown", () => {
  expect(strongestSensor(strengths(0, 0, 0, 8.4))).toBe("minmatar");
  expect(strongestSensor(strengths(12, 14, undefined, 3))).toBe("caldari");
});

test("a tie goes to the first", () => {
  expect(strongestSensor(strengths())).toBe("amarr");
  expect(strongestSensor(strengths(0, 5, 5, 0))).toBe("caldari");
});
