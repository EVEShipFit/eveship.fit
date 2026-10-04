import { beforeAll, describe, expect, test } from "vitest";

import { canFit, chargesFor, droneRoom, modesOf, placementOf, type Engine } from "../src/index.js";
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

  test("capital modules go on capital ships only", () => {
    expect(canFit(engine.sde, type("Capital Armor Repairer II"), type("Rifter"))).toBe(false);
    expect(canFit(engine.sde, type("Capital Armor Repairer II"), type("Archon"))).toBe(true);
  });

  test("structure items go on structures, and ship items on ships", () => {
    expect(canFit(engine.sde, type("Damage Control II"), type("Astrahus"))).toBe(false);
    expect(canFit(engine.sde, type("Standup Layered Armor Plating I"), type("Rifter"))).toBe(false);
    expect(canFit(engine.sde, type("Standup Templar II"), type("Archon"))).toBe(false);
    expect(canFit(engine.sde, type("Standup Templar II"), type("Astrahus"))).toBe(true);
    expect(canFit(engine.sde, type("EMP S"), type("Astrahus"))).toBe(true);
  });

  test("fighters need a tube of their kind", () => {
    expect(canFit(engine.sde, type("Templar II"), type("Archon"))).toBe(true);
    expect(canFit(engine.sde, type("Cyclops II"), type("Archon"))).toBe(false);
    expect(canFit(engine.sde, type("Cyclops II"), type("Nyx"))).toBe(true);
    expect(canFit(engine.sde, type("Standup Cyclops I"), type("Tatara"))).toBe(false);
    expect(canFit(engine.sde, type("Standup Cyclops I"), type("Fortizar"))).toBe(true);
  });
});

describe("drones", () => {
  test("room is what the active limit and the bandwidth leave", () => {
    const fit = engine.createFit({
      ship: { type_id: type("Tristan").id },
      items: [{ type_id: type("Hammerhead II").id, slot: { type: "drone_bay" }, quantity: 2, state: "active" }],
    });
    const { stats } = fit.getSnapshot();
    expect(droneRoom(engine.sde, stats, type("Hobgoblin II"))).toBe(1);
    expect(droneRoom(engine.sde, stats, type("Hammerhead II"))).toBe(0);
    expect(droneRoom(engine.sde, stats, type("Warrior II"))).toBe(1);
  });

  test("no room over the limit, or without a drone bay", () => {
    const over = engine.createFit({
      ship: { type_id: type("Tristan").id },
      items: [{ type_id: type("Hobgoblin II").id, slot: { type: "drone_bay" }, quantity: 7, state: "active" }],
    });
    expect(droneRoom(engine.sde, over.getSnapshot().stats, type("Hobgoblin II"))).toBe(0);

    const rifter = engine.createFit({ ship: { type_id: type("Rifter").id }, items: [] });
    expect(droneRoom(engine.sde, rifter.getSnapshot().stats, type("Hobgoblin II"))).toBe(0);
  });
});

function modeNames(ship: string) {
  return modesOf(engine.sde, type(ship)).map((mode) => mode.name);
}

describe("modes", () => {
  test("a ship's modes are named after it, in the order EVE shows them", () => {
    expect(modeNames("Svipul")).toEqual(["Svipul Defense Mode", "Svipul Sharpshooter Mode", "Svipul Propulsion Mode"]);
    expect(modeNames("Anhinga")).toEqual(["Anhinga Primary Mode", "Anhinga Secondary Mode", "Anhinga Tertiary Mode"]);
  });

  test("only the tactical destroyers and the Anhinga have modes, three each", () => {
    const withModes = [...engine.sde.types()].filter((ship) => modesOf(engine.sde, ship).length > 0);
    expect(withModes.map((ship) => ship.name).toSorted()).toEqual([
      "Anhinga",
      "Confessor",
      "Hecate",
      "Jackdaw",
      "Skua",
      "Svipul",
    ]);
    for (const ship of withModes) expect(modesOf(engine.sde, ship)).toHaveLength(3);
  });
});
