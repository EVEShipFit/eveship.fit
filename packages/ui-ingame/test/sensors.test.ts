import { expect, test } from "vitest";

import { strongestSensor } from "../src/components/ShipStatistics/sensors";

test("the strongest sensor is shown", () => {
  expect(strongestSensor({ amarr: 0, caldari: 0, gallente: 0, minmatar: 8.4 })).toBe("minmatar");
  expect(strongestSensor({ amarr: 12, caldari: 14, gallente: undefined, minmatar: 3 })).toBe("caldari");
});

test("a tie goes to the first", () => {
  expect(strongestSensor({ amarr: undefined, caldari: undefined, gallente: undefined, minmatar: undefined })).toBe(
    "amarr",
  );
  expect(strongestSensor({ amarr: 0, caldari: 5, gallente: 5, minmatar: 0 })).toBe("caldari");
});
