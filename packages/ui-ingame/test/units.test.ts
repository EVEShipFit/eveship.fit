import { expect, test } from "vitest";

import { hitpoints } from "../src/components/ShipStatistics/units";

test("hitpoints in millions above 100 thousand, and in billions above 100 million", () => {
  const format = { decimals: 0 };
  expect(hitpoints(562, format)).toBe("562 hp");
  expect(hitpoints(100_000, format)).toBe("100,000 hp");
  expect(hitpoints(100_001, format)).toBe("0.10M hp");
  expect(hitpoints(33_750_000, format)).toBe("33.75M hp");
  expect(hitpoints(100_000_000, format)).toBe("100.00M hp");
  expect(hitpoints(108_000_000, format)).toBe("0.11B hp");
  expect(hitpoints(135_000_000, format)).toBe("0.14B hp");
});
