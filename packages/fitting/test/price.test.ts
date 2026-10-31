import { beforeAll, expect, test } from "vitest";

import { fitPrice, fitPriceItems, type Engine, type Fit } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

const ABYSSAL_DAMAGE_CONTROL = 52227;

let engine: Engine;
beforeAll(async () => {
  engine = await testEngine();
});

function prices(byName: Record<string, number>): (typeId: number) => number | undefined {
  const byId = new Map(Object.entries(byName).map(([name, price]) => [typeIdOf(engine, name), price]));
  return (typeId) => byId.get(typeId);
}

function caracal(items: Fit["items"]): Fit {
  return { ship: { type_id: typeIdOf(engine, "Caracal") }, items };
}

test("an empty hull costs the hull", () => {
  expect(fitPrice(engine.sde, caracal([]), prices({ Caracal: 10_000_000 }))).toBe(10_000_000);
});

test("items count by quantity", () => {
  const fit = caracal([
    { type_id: typeIdOf(engine, "Hobgoblin I"), slot: { type: "drone_bay" }, quantity: 5, state: "active" },
  ]);

  expect(fitPrice(engine.sde, fit, prices({ Caracal: 10_000_000, "Hobgoblin I": 2_000 }))).toBe(10_010_000);
});

test("a charge counts as many times as it fills its module", () => {
  const fit = caracal([
    {
      type_id: typeIdOf(engine, "Heavy Missile Launcher I"),
      slot: { type: "high", index: 0 },
      state: "active",
      charge: { type_id: typeIdOf(engine, "Caldari Navy Inferno Heavy Missile") },
    },
  ]);

  const price = fitPrice(
    engine.sde,
    fit,
    prices({ Caracal: 0, "Heavy Missile Launcher I": 100_000, "Caldari Navy Inferno Heavy Missile": 1_000 }),
  );

  expect(price).toBe(100_000 + 30 * 1_000);
});

test("a mutated module costs its base type", () => {
  const fit = caracal([
    {
      type_id: ABYSSAL_DAMAGE_CONTROL,
      slot: { type: "low", index: 0 },
      state: "active",
      mutation: { base: typeIdOf(engine, "Damage Control II") },
    },
  ]);

  expect(fitPrice(engine.sde, fit, prices({ "Damage Control II": 500_000 }))).toBe(500_000);
});

test("implants and boosters are the pilot's, not the fit's", () => {
  const fit = caracal([
    { type_id: typeIdOf(engine, "High-grade Crystal Alpha"), slot: { type: "implant", index: 0 }, state: "online" },
    { type_id: typeIdOf(engine, "Standard Blue Pill Booster"), slot: { type: "booster", index: 0 }, state: "online" },
  ]);

  const price = fitPrice(
    engine.sde,
    fit,
    prices({ Caracal: 10_000_000, "High-grade Crystal Alpha": 58_000_000, "Standard Blue Pill Booster": 1_000_000 }),
  );

  expect(price).toBe(10_000_000);
});

test("a type without a price is free", () => {
  expect(fitPrice(engine.sde, caracal([]), () => undefined)).toBe(0);
});

test("the items add up the same types, most expensive first", () => {
  const launcher = {
    type_id: typeIdOf(engine, "Heavy Missile Launcher I"),
    state: "active",
    charge: { type_id: typeIdOf(engine, "Caldari Navy Inferno Heavy Missile") },
  } as const;
  const fit = caracal([
    { ...launcher, slot: { type: "high", index: 0 } },
    { ...launcher, slot: { type: "high", index: 1 } },
    { type_id: typeIdOf(engine, "Hobgoblin I"), slot: { type: "drone_bay" }, quantity: 5, state: "active" },
  ]);

  const items = fitPriceItems(
    engine.sde,
    fit,
    prices({ Caracal: 10_000_000, "Heavy Missile Launcher I": 100_000, "Caldari Navy Inferno Heavy Missile": 1_000 }),
  );

  expect(items).toEqual([
    { typeId: typeIdOf(engine, "Caracal"), quantity: 1, price: 10_000_000 },
    { typeId: typeIdOf(engine, "Heavy Missile Launcher I"), quantity: 2, price: 100_000 },
    { typeId: typeIdOf(engine, "Caldari Navy Inferno Heavy Missile"), quantity: 60, price: 1_000 },
    { typeId: typeIdOf(engine, "Hobgoblin I"), quantity: 5, price: undefined },
  ]);
});
