import type { Sde } from "@eveshipfit/sde-loader";
import { beforeAll, expect, test } from "vitest";

import { formatAttribute, formatClock, formatDuration, formatNumber, roundingOf } from "../src/index.js";
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
  expect(formatNumber(2, { decimals: 1, fixed: true })).toBe("2.0");
  expect(formatNumber(3375, { decimals: 1, fixed: true, grouping: false })).toBe("3375.0");
  expect(formatNumber(-0.01, { decimals: 1 })).toBe("0");
});

test("numbers round the way asked", () => {
  expect(formatNumber(1.99, { decimals: 1, rounding: "down" })).toBe("1.9");
  expect(formatNumber(1.91, { decimals: 1, rounding: "up" })).toBe("2");
  expect(formatNumber(-1.91, { decimals: 1, rounding: "down" })).toBe("-2");
  expect(formatNumber(-2.5, { decimals: 0 })).toBe("-3");
  // (1 - 0.63) * 100 is 37.00000000000001.
  expect(formatNumber((1 - 0.63) * 100, { decimals: 0, rounding: "up" })).toBe("37");
});

test("durations", () => {
  expect(formatDuration(112)).toBe("1m 52s");
  expect(formatDuration(3723)).toBe("1h 2m 3s");
  expect(formatDuration(120)).toBe("2m");
  expect(formatDuration(0.2)).toBe("0s");
  expect(formatDuration(111.2, "up")).toBe("1m 52s");
  expect(formatClock(90)).toBe("00:01:30");
  expect(formatClock(3723.9, "down")).toBe("01:02:03");
});

function rounding(name: string) {
  return roundingOf(sde, sde.attributeId(name)!);
}

test("attributes round towards worse", () => {
  expect(rounding("maxVelocity")).toBe("down");
  expect(rounding("signatureRadius")).toBe("up");
  // Shown as a resistance, which is better where the resonance is worse.
  expect(rounding("shieldEmDamageResonance")).toBe("down");
});

test.each([
  ["cpuOutput", 187.5, "187.5 tf"],
  ["powerOutput", 50, "50 MW"],
  ["maxTargetRange", 22_500, "22.5 km"],
  ["optimalSigRadius", 400, "400 m"],
  ["duration", 5000, "5 s"],
  ["shieldEmDamageResonance", 0.75, "25 %"],
  ["shieldEmDamageResonance", 0.625, "37.5 %"],
  ["shieldEmDamageResonance", 0.62555, "37.44 %"],
  ["signatureRadius", 36.001, "36.01 m"],
  ["damageMultiplier", 1.1, "1.1 x"],
  ["chargeSize", 1, "Small"],
])("%s %d shows as %s", (name, value, text) => {
  expect(format(name, value)).toBe(text);
});
