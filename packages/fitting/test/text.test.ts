import { expect, test } from "vitest";

import { testEngine, typeIdOf } from "./engine.js";

const eft = "[Rifter, My Rifter]\nDamage Control II\n\n200mm AutoCannon II, EMP S\n\nHobgoblin II x5\n";

test("EFT text", async () => {
  const engine = await testEngine();

  const fit = engine.loadText(eft);

  expect(fit.name).toBe("My Rifter");
  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(
    expect.objectContaining({ type_id: typeIdOf(engine, "200mm AutoCannon II"), slot: { type: "high", index: 0 } }),
  );
});

test("esf/1 text reads back as the fit it was saved from", async () => {
  const engine = await testEngine();
  const fit = engine.loadText(eft);

  const saved = engine.saveText(fit, "esf");

  expect(saved).toMatch(/^%esf\/1\n/);
  const loaded = engine.loadText(`\n${saved}`);
  expect(loaded.name).toBe("My Rifter");
  expect(loaded.items).toContainEqual(
    expect.objectContaining({
      type_id: typeIdOf(engine, "200mm AutoCannon II"),
      charge: { type_id: typeIdOf(engine, "EMP S") },
    }),
  );
  expect(loaded.items).toContainEqual(
    expect.objectContaining({ type_id: typeIdOf(engine, "Hobgoblin II"), slot: { type: "drone_bay" }, quantity: 5 }),
  );
});

test("EFT text reads back as the fit it was saved from", async () => {
  const engine = await testEngine();
  const fit = engine.loadText(eft);

  const saved = engine.saveText(fit, "eft");

  expect(saved).toMatch(/^\[Rifter, My Rifter\]\n/);
  expect(engine.loadText(saved)).toEqual(fit);
});

test("an unknown type names it", async () => {
  const engine = await testEngine();

  expect(() => engine.loadText("[Rifter, My Rifter]\nDamage Contrl II")).toThrow("unknown type Damage Contrl II");
});

test("an ESI fitting", async () => {
  const engine = await testEngine();
  const autocannon = typeIdOf(engine, "200mm AutoCannon II");
  const hobgoblin = typeIdOf(engine, "Hobgoblin II");

  const fit = engine.loadEsiFitting({
    fitting_id: 1,
    name: "My Rifter",
    description: "",
    ship_type_id: 587,
    items: [
      { type_id: autocannon, flag: "HiSlot0", quantity: 1 },
      { type_id: hobgoblin, flag: "DroneBay", quantity: 5 },
    ],
  });

  expect(fit.name).toBe("My Rifter");
  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(expect.objectContaining({ type_id: autocannon, slot: { type: "high", index: 0 } }));
  expect(fit.items).toContainEqual(
    expect.objectContaining({ type_id: hobgoblin, slot: { type: "drone_bay" }, quantity: 5 }),
  );
});
