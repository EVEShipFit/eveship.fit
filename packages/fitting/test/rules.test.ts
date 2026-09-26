import { beforeAll, describe, expect, test } from "vitest";

import { canFit, chargesFor, placementOf, type Engine } from "../src/index.js";
import { testEngine } from "./engine.js";

let engine: Engine;
beforeAll(async () => {
  engine = await testEngine();
});

function type(name: string) {
  return engine.sde.typeByName(name)!;
}

describe("placement", () => {
  test.each([
    ["200mm AutoCannon II", { type: "high" }],
    ["1MN Afterburner II", { type: "medium" }],
    ["Damage Control II", { type: "low" }],
    ["Small Projectile Burst Aerator I", { type: "rig" }],
    ["Loki Core - Augmented Nuclear Reactor", { type: "subsystem", index: 0 }],
    ["Loki Propulsion - Wake Limiter", { type: "subsystem", index: 3 }],
    ["EMP S", { type: "charge" }],
    ["Warrior II", { type: "drone_bay" }],
    ["Templar II", { type: "fighter_bay" }],
    ["Mobile Tractor Unit", { type: "cargo" }],
    ["Rifter", undefined],
  ])("%s", (name, placement) => {
    expect(placementOf(engine.sde, type(name))).toEqual(placement);
  });

  test("implants and boosters go in their numbered slot", () => {
    expect(placementOf(engine.sde, type("Genolution Core Augmentation CA-1"))).toEqual({ type: "implant", index: 1 });
    expect(placementOf(engine.sde, type("Standard Blue Pill Booster"))).toMatchObject({ type: "booster" });
  });
});

describe("filters", () => {
  test("charges for a module fit its group and size", () => {
    const charges = chargesFor(engine.sde, type("200mm AutoCannon II")).map((charge) => charge.name);
    expect(charges).toContain("EMP S");
    expect(charges).toContain("Republic Fleet EMP S");
    expect(charges).not.toContain("EMP M");
    expect(charges).not.toContain("Nova Rocket");
  });

  test("a module without charges has none", () => {
    expect(chargesFor(engine.sde, type("Damage Control II"))).toEqual([]);
  });

  test("hull restrictions", () => {
    const rifter = type("Rifter");
    expect(canFit(engine.sde, type("200mm AutoCannon II"), rifter)).toBe(true);
    expect(canFit(engine.sde, type("Small Projectile Burst Aerator I"), rifter)).toBe(true);
    expect(canFit(engine.sde, type("Medium Projectile Burst Aerator I"), rifter)).toBe(false);
    expect(canFit(engine.sde, type("Loki Core - Augmented Nuclear Reactor"), rifter)).toBe(false);
    expect(canFit(engine.sde, type("Loki Core - Augmented Nuclear Reactor"), type("Loki"))).toBe(true);
  });
});
