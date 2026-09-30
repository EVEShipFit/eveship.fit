import type { MarketPrice } from "@eveshipfit/esi";
import { beforeAll, expect, test } from "vitest";

import { fitPrice, type Engine, type Fit } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

const ABYSSAL_DAMAGE_CONTROL = 52227;

let engine: Engine;
beforeAll(async () => {
  engine = await testEngine();
});

function prices(byName: Record<string, number>): Map<number, MarketPrice> {
  return new Map(
    Object.entries(byName).map(([name, average_price]) => {
      const type_id = typeIdOf(engine, name);
      return [type_id, { type_id, average_price }];
    }),
  );
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
  expect(fitPrice(engine.sde, caracal([]), new Map())).toBe(0);
});
