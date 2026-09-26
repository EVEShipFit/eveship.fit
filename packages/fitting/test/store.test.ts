import { beforeAll, describe, expect, test, vi } from "vitest";

import type { Engine, FitStore } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

let engine: Engine;
let id: (name: string) => number;
beforeAll(async () => {
  engine = await testEngine();
  id = (name) => typeIdOf(engine, name);
});

function rifter(): FitStore {
  return engine.createFit({ ship: id("Rifter") });
}

describe("fit", () => {
  test("modules go in the first free slot of their rack", () => {
    const fit = rifter();
    fit.fit(id("200mm AutoCannon II"));
    fit.fit(id("Damage Control II"));
    fit.fit(id("200mm AutoCannon II"));

    expect(fit.getSnapshot().fit.items.map((item) => item.slot)).toEqual([
      { type: "high", index: 0 },
      { type: "low", index: 0 },
      { type: "high", index: 1 },
    ]);
  });

  test("a full rack takes nothing more", () => {
    const fit = rifter();
    for (let i = 0; i < 3; i++) expect(fit.fit(id("200mm AutoCannon II"))).toBe(i);

    const before = fit.getSnapshot();
    expect(fit.fit(id("200mm AutoCannon II"))).toBeUndefined();
    expect(fit.getSnapshot()).toBe(before);
  });

  test("into a given slot, replacing what is there", () => {
    const fit = rifter();
    fit.fit(id("200mm AutoCannon II"));
    fit.fit(id("Rocket Launcher II"), { type: "high", index: 0 });
    expect(fit.getSnapshot().fit.items).toMatchObject([{ type_id: id("Rocket Launcher II") }]);

    expect(fit.fit(id("Rocket Launcher II"), { type: "low", index: 0 })).toBeUndefined();
  });

  test("a charge loads into every module that takes it", () => {
    const fit = rifter();
    fit.fit(id("200mm AutoCannon II"));
    fit.fit(id("Rocket Launcher II"));
    fit.fit(id("200mm AutoCannon II"));
    fit.fit(id("EMP S"));

    expect(fit.getSnapshot().fit.items.map((item) => item.charge?.type_id)).toEqual([
      id("EMP S"),
      undefined,
      id("EMP S"),
    ]);
  });

  test("a charge nothing takes goes in the cargo", () => {
    const fit = rifter();
    fit.fit(id("EMP S"));
    expect(fit.getSnapshot().fit.items).toEqual([
      { type_id: id("EMP S"), slot: { type: "cargo" }, quantity: 1, state: "offline" },
    ]);
  });

  test("drones stack in the drone bay", () => {
    const fit = engine.createFit({ ship: id("Tristan") });
    fit.fit(id("Warrior II"));
    fit.fit(id("Warrior II"));
    expect(fit.getSnapshot().fit.items).toEqual([
      { type_id: id("Warrior II"), slot: { type: "drone_bay" }, quantity: 2, state: "active" },
    ]);
  });

  test("a given slot that does not take the type takes nothing", () => {
    const fit = rifter();
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const before = fit.getSnapshot();

    expect(fit.fit(id("Nova Rocket"), { type: "high", index: gun })).toBeUndefined();
    expect(fit.fit(id("Warrior II"), { type: "cargo" })).toBeUndefined();
    expect(fit.fit(id("Loki Core - Augmented Nuclear Reactor"), { type: "subsystem", index: 1 })).toBeUndefined();
    expect(fit.getSnapshot()).toBe(before);
  });

  test("a ship is not an item", () => {
    const fit = rifter();
    expect(fit.fit(id("Rifter"))).toBeUndefined();
  });
});

describe("edits", () => {
  test("state, charge, quantity and removal", () => {
    const fit = rifter();
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const cargo = fit.fit(id("Nanite Repair Paste"))!;

    fit.setState(gun, "offline");
    fit.setCharge(gun, id("EMP S"));
    fit.setQuantity(cargo, 50);
    expect(fit.getSnapshot().fit.items).toMatchObject([
      { state: "offline", charge: { type_id: id("EMP S") } },
      { quantity: 50 },
    ]);

    fit.setCharge(gun, undefined);
    expect(fit.getSnapshot().fit.items[gun]).not.toHaveProperty("charge");

    fit.remove(gun);
    expect(fit.getSnapshot().fit.items).toMatchObject([{ type_id: id("Nanite Repair Paste") }]);
  });

  test("the snapshot is new after every change, the old one untouched", () => {
    const fit = rifter();
    const before = fit.getSnapshot();
    fit.fit(id("Damage Control II"));

    expect(fit.getSnapshot()).not.toBe(before);
    expect(before.fit.items).toEqual([]);
  });

  test("listeners hear every change until they unsubscribe", () => {
    const fit = rifter();
    const listener = vi.fn<() => void>();
    const unsubscribe = fit.subscribe(listener);

    fit.fit(id("Damage Control II"));
    fit.setName("Brawler");
    unsubscribe();
    fit.setName("Kiter");

    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("history", () => {
  test("undo and redo", () => {
    const fit = rifter();
    fit.fit(id("Damage Control II"));
    fit.fit(id("Gyrostabilizer II"));

    fit.undo();
    expect(fit.getSnapshot().fit.items).toHaveLength(1);
    fit.undo();
    expect(fit.getSnapshot().fit.items).toHaveLength(0);
    expect(fit.canUndo).toBe(false);

    fit.redo();
    expect(fit.getSnapshot().fit.items).toHaveLength(1);
    expect(fit.canRedo).toBe(true);
  });

  test("a new edit drops what could be redone", () => {
    const fit = rifter();
    fit.fit(id("Damage Control II"));
    fit.undo();
    fit.fit(id("Gyrostabilizer II"));
    expect(fit.canRedo).toBe(false);
  });

  test("an edit that changes nothing is not in the history", () => {
    const fit = rifter();
    fit.setName("Brawler");
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const before = fit.getSnapshot();

    fit.setName("Brawler");
    fit.setState(gun, "active");
    fit.setCharge(gun, undefined);
    fit.setQuantity(gun, 1);
    fit.remove(5);
    expect(fit.getSnapshot()).toBe(before);

    fit.undo();
    expect(fit.getSnapshot().fit.items).toEqual([]);
  });

  test("changing the character is not an edit", () => {
    const fit = rifter();
    fit.setCharacter({ skills: {} });
    expect(fit.canUndo).toBe(false);
  });

  test("replace can be undone", () => {
    const fit = rifter();
    fit.replace({ ship: { type_id: id("Tristan") }, items: [], character: { skills: {} } });
    expect(fit.getSnapshot().fit).toEqual({ ship: { type_id: id("Tristan") }, items: [] });

    fit.undo();
    expect(fit.getSnapshot().fit.ship.type_id).toBe(id("Rifter"));
  });
});

describe("character", () => {
  test("defaults to every skill at V", () => {
    const fit = rifter();
    const withSkills = fit.getSnapshot().stats.ship.get("maxVelocity")!;

    fit.setCharacter({ skills: {} });
    expect(fit.getSnapshot().stats.ship.get("maxVelocity")).toBeLessThan(withSkills);
  });
});

test("preview shows the change without making it", () => {
  const fit = rifter();
  const listener = vi.fn<() => void>();
  fit.subscribe(listener);

  const { before, after } = fit.preview((draft) => draft.fit(id("Damage Control II")));

  expect(before).toBe(fit.getSnapshot());
  expect(after.fit.items).toHaveLength(1);
  expect(after.stats.ship.get("cpuLoad")).toBeGreaterThan(before.stats.ship.get("cpuLoad")!);
  expect(fit.canUndo).toBe(false);
  expect(listener).not.toHaveBeenCalled();
});
