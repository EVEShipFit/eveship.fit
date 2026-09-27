import { beforeAll, expect, test } from "vitest";

import { missingSkills, typesInUse, type Engine, type Fit } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

let engine: Engine;
beforeAll(async () => {
  engine = await testEngine();
});

const noSkills = { skills: {} };

test("all skills at V miss nothing", () => {
  const ships = ["Rifter", "Thanatos", "Avatar"].map((name) => typeIdOf(engine, name));
  expect(missingSkills(engine.sde, engine.defaultCharacter, ships)).toEqual([]);
});

test("a ship needs its skills and what those need", () => {
  const missing = missingSkills(engine.sde, noSkills, [typeIdOf(engine, "Rifter")]);
  expect(missing[0]).toEqual({ type_id: typeIdOf(engine, "Minmatar Frigate"), required: 1, level: 0 });
  expect(missing).toContainEqual({ type_id: typeIdOf(engine, "Spaceship Command"), required: 1, level: 0 });
});

test("a skill trained high enough is not missing", () => {
  const minmatarFrigate = typeIdOf(engine, "Minmatar Frigate");
  const trained = missingSkills(engine.sde, { skills: new Map([[minmatarFrigate, 1]]) }, [typeIdOf(engine, "Rifter")]);
  expect(trained.map((skill) => skill.type_id)).not.toContain(minmatarFrigate);
});

test("it finds what the engine finds", () => {
  const fit: Fit = {
    ship: { type_id: typeIdOf(engine, "Rifter") },
    items: [
      {
        type_id: typeIdOf(engine, "200mm AutoCannon II"),
        slot: { type: "high", index: 0 },
        state: "active",
        charge: { type_id: typeIdOf(engine, "EMP S") },
      },
      { type_id: typeIdOf(engine, "Damage Control II"), slot: { type: "low", index: 0 }, state: "active" },
      { type_id: typeIdOf(engine, "Hobgoblin II"), slot: { type: "drone_bay" }, quantity: 1, state: "active" },
      { type_id: typeIdOf(engine, "Warp Disruptor II"), slot: { type: "cargo" }, quantity: 1, state: "offline" },
    ],
  };

  const engineFound = new Map<number, number>();
  for (const { rule } of engine.calculate(fit, noSkills).violations) {
    if (rule.type !== "skill") continue;
    engineFound.set(rule.type_id, Math.max(engineFound.get(rule.type_id) ?? 0, rule.required));
  }

  expect(engineFound.size).toBeGreaterThan(0);

  const found = missingSkills(engine.sde, noSkills, typesInUse(fit));
  expect(new Map(found.map((skill) => [skill.type_id, skill.required]))).toEqual(engineFound);
});

test("the cargo needs no skills", () => {
  const rifter = typeIdOf(engine, "Rifter");
  const emp = typeIdOf(engine, "EMP S");
  const fit: Fit = {
    ship: { type_id: rifter },
    items: [{ type_id: emp, slot: { type: "cargo" }, quantity: 100, state: "offline" }],
  };
  expect(typesInUse(fit)).toEqual([rifter]);
});
