import { beforeAll, expect, test } from "vitest";

import type { Engine } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

let engine: Engine;
let id: (name: string) => number;
beforeAll(async () => {
  engine = await testEngine();
  id = (name) => typeIdOf(engine, name);
});

test("attributes by name, by ID, and before effects", () => {
  const { stats } = engine.createFit({ ship: id("Rifter") }).getSnapshot();
  expect(stats.ship.get("cpuOutput")).toBe(stats.ship.get(48));
  expect(stats.ship.get("cpuOutput")).toBeGreaterThan(stats.ship.base("cpuOutput")!);
  expect(stats.ship.get("noSuchAttribute")).toBeUndefined();
});

test("slots, hardpoints and cargo", () => {
  const fit = engine.createFit({ ship: id("Rifter") });
  fit.fit(id("200mm AutoCannon II"));
  fit.fit(id("Rocket Launcher II"));
  fit.fit(id("Damage Control II"));
  const paste = fit.fit(id("Nanite Repair Paste"))!;
  fit.setQuantity(paste, 10);

  const { stats } = fit.getSnapshot();
  expect(stats.slots.high).toEqual({ used: 2, total: 3 });
  expect(stats.slots.low).toEqual({ used: 1, total: 4 });
  expect(stats.slots.subsystem).toEqual({ used: 0, total: 0 });
  expect(stats.hardpoints).toEqual({ turret: { used: 1, total: 3 }, launcher: { used: 1, total: 2 } });
  expect(stats.cargo.used).toBeCloseTo(0.1);
  expect(stats.cargo.total).toBe(140);
});

test("items are index-parallel to the fit", () => {
  const fit = engine.createFit({ ship: id("Rifter") });
  fit.fit(id("200mm AutoCannon II"));
  fit.fit(id("EMP S"));

  const [gun] = fit.getSnapshot().stats.items;
  expect(gun!.state).toBe("active");
  expect(gun!.maxState).toBe("overload");
  expect(gun!.charge?.get("emDamage")).toBeGreaterThan(0);
});

test("subsystems each go in their own slot", () => {
  const fit = engine.createFit({ ship: id("Loki") });
  for (const subsystem of [
    "Loki Propulsion - Wake Limiter",
    "Loki Core - Augmented Nuclear Reactor",
    "Loki Offensive - Launcher Efficiency Configuration",
    "Loki Defensive - Covert Reconfiguration",
  ]) {
    fit.fit(id(subsystem));
  }

  const { fit: loki, stats } = fit.getSnapshot();
  expect(loki.items.map((item) => item.slot)).toEqual([3, 0, 2, 1].map((index) => ({ type: "subsystem", index })));
  expect(stats.slots.subsystem.used).toBe(4);
});

test("violations are what the engine reports", () => {
  const fit = engine.createFit({ ship: id("Rifter") });
  expect(fit.getSnapshot().stats.violations).toEqual([]);

  for (let i = 0; i < 4; i++) fit.fit(id("Co-Processor II"));
  fit.fit(id("Medium Projectile Burst Aerator I"), { type: "rig", index: 0 });
  fit.setCharacter({ skills: {} });

  const rules = fit.getSnapshot().stats.violations.map((violation) => violation.rule.type);
  expect(rules).toContain("rig_size");
  expect(rules).toContain("skill");
});
