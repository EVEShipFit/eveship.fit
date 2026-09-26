import type { Sde } from "@eveshipfit/sde-loader";
import { beforeAll, expect, test } from "vitest";

import { formatAttribute, formatNumber } from "../src/index.js";
import { testEngine } from "./files.js";

let sde: Sde;
beforeAll(async () => {
  sde = (await testEngine()).sde;
});

function format(name: string, value: number) {
  return formatAttribute(sde, sde.attributeId(name)!, value);
}

test("numbers", () => {
  expect(formatNumber(1234.5678)).toBe("1,234.57");
  expect(formatNumber(2, { decimals: 1 })).toBe("2");
  expect(formatNumber(0.25, { decimals: 0 })).toBe("0");
});

test.each([
  ["cpuOutput", 187.5, "187.5 tf"],
  ["powerOutput", 50, "50 MW"],
  ["maxTargetRange", 22_500, "22.5 km"],
  ["optimalSigRadius", 400, "400 m"],
  ["duration", 5000, "5 s"],
  ["shieldEmDamageResonance", 0.75, "25 %"],
  ["damageMultiplier", 1.1, "1.1 x"],
  ["chargeSize", 1, "Small"],
])("%s %d shows as %s", (name, value, text) => {
  expect(format(name, value)).toBe(text);
});
