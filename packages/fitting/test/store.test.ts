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

function stacks(fit: FitStore) {
  return fit.getSnapshot().fit.items.map(({ quantity, state }) => [quantity, state]);
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

  test("only the cargo takes a charge nothing else takes, or a type that goes nowhere else", () => {
    const fit = rifter();
    expect(fit.fit(id("EMP S"))).toBeUndefined();
    expect(fit.fit(id("Mobile Tractor Unit"))).toBeUndefined();
    expect(fit.getSnapshot().fit.items).toEqual([]);

    fit.fit(id("EMP S"), { type: "cargo" });
    fit.fit(id("EMP S"), { type: "cargo" });
    fit.fit(id("Mobile Tractor Unit"), { type: "cargo" });
    expect(fit.getSnapshot().fit.items).toEqual([
      { type_id: id("EMP S"), slot: { type: "cargo" }, quantity: 2, state: "offline" },
      { type_id: id("Mobile Tractor Unit"), slot: { type: "cargo" }, quantity: 1, state: "offline" },
    ]);
  });

  test("the cargo takes modules and drones too", () => {
    const fit = rifter();
    fit.fit(id("Damage Control II"), { type: "cargo" });
    fit.fit(id("Warrior II"), { type: "cargo" });
    expect(fit.getSnapshot().fit.items.map(({ type_id, slot }) => [type_id, slot.type])).toEqual([
      [id("Damage Control II"), "cargo"],
      [id("Warrior II"), "cargo"],
    ]);
    expect(fit.fit(id("Rifter"), { type: "cargo" })).toBeUndefined();
  });

  test("drones stack in the drone bay", () => {
    const fit = engine.createFit({ ship: id("Tristan") });
    fit.fit(id("Warrior II"));
    fit.fit(id("Warrior II"));
    expect(fit.getSnapshot().fit.items).toEqual([
      { type_id: id("Warrior II"), slot: { type: "drone_bay" }, quantity: 2, state: "active" },
    ]);
  });

  test("drones go in active until the active limit or the bandwidth is reached", () => {
    const hobgoblins = engine.createFit({ ship: id("Tristan") });
    for (let i = 0; i < 6; i++) hobgoblins.fit(id("Hobgoblin II"));
    expect(stacks(hobgoblins)).toEqual([
      [5, "active"],
      [1, "offline"],
    ]);

    const hammerheads = engine.createFit({ ship: id("Tristan") });
    for (let i = 0; i < 3; i++) hammerheads.fit(id("Hammerhead II"));
    expect(stacks(hammerheads)).toEqual([
      [2, "active"],
      [1, "offline"],
    ]);
  });

  test("a full squadron of fighters goes in the first free tube of its kind, then in the bay", () => {
    const fit = engine.createFit({ ship: id("Thanatos") });
    fit.fit(id("Dromi II"));
    fit.fit(id("Dromi II"));
    fit.fit(id("Dromi II"));
    fit.fit(id("Templar II"));

    expect(fit.getSnapshot().fit.items).toEqual([
      { type_id: id("Dromi II"), slot: { type: "fighter_tube", index: 0 }, quantity: 3, state: "active" },
      { type_id: id("Dromi II"), slot: { type: "fighter_tube", index: 1 }, quantity: 3, state: "active" },
      { type_id: id("Dromi II"), slot: { type: "fighter_bay" }, quantity: 3, state: "offline" },
      { type_id: id("Templar II"), slot: { type: "fighter_tube", index: 2 }, quantity: 6, state: "active" },
    ]);
    fit.fit(id("Dromi II"));
    expect(fit.getSnapshot().fit.items[2]).toMatchObject({ slot: { type: "fighter_bay" }, quantity: 6 });
  });

  test("a given fighter tube takes a squadron of a kind it has room for", () => {
    const fit = engine.createFit({ ship: id("Thanatos") });
    fit.fit(id("Dromi II"));
    fit.fit(id("Dromi II"));

    expect(fit.fit(id("Dromi II"), { type: "fighter_tube", index: 3 })).toBeUndefined();
    expect(fit.fit(id("Templar II"), { type: "fighter_tube", index: 4 })).toBeUndefined();
    expect(fit.fit(id("Siren II"), { type: "fighter_tube", index: 1 })).toBe(1);
    expect(fit.fit(id("Templar II"), { type: "fighter_tube", index: 0 })).toBe(0);
    expect(fit.fit(id("Templar II"), { type: "fighter_bay" })).toBe(2);
    expect(fit.getSnapshot().fit.items.map((item) => [item.type_id, item.slot])).toEqual([
      [id("Templar II"), { type: "fighter_tube", index: 0 }],
      [id("Siren II"), { type: "fighter_tube", index: 1 }],
      [id("Templar II"), { type: "fighter_bay" }],
    ]);
  });

  test("a carrier does not launch standup fighters, nor a structure those of a carrier", () => {
    const carrier = engine.createFit({ ship: id("Thanatos") });
    carrier.fit(id("Standup Templar I"));
    expect(carrier.getSnapshot().fit.items.map((item) => item.slot)).toEqual([{ type: "fighter_bay" }]);

    const structure = engine.createFit({ ship: id("Astrahus") });
    expect(structure.fit(id("Templar II"), { type: "fighter_tube", index: 0 })).toBeUndefined();
  });

  test("a structure launches standup fighters from its tubes", () => {
    const fit = engine.createFit({ ship: id("Astrahus") });
    fit.fit(id("Standup Dromi I"));
    fit.fit(id("Standup Dromi I"));

    expect(fit.getSnapshot().fit.items.map((item) => item.slot)).toEqual([
      { type: "fighter_tube", index: 0 },
      { type: "fighter_bay" },
    ]);
  });

  test("a given slot that does not take the type takes nothing", () => {
    const fit = rifter();
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const before = fit.getSnapshot();

    expect(fit.fit(id("Nova Rocket"), { type: "high", index: gun })).toBeUndefined();
    expect(fit.fit(id("Damage Control II"), { type: "drone_bay" })).toBeUndefined();
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
    const cargo = fit.fit(id("Nanite Repair Paste"), { type: "cargo" })!;

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

  test("active drones split a type into an active and an offline stack", () => {
    const fit = engine.createFit({ ship: id("Tristan") });
    fit.fit(id("Hobgoblin II"));
    for (let i = 0; i < 3; i++) fit.fit(id("Warrior II"));
    const drones = () => fit.getSnapshot().fit.items.map(({ type_id, quantity, state }) => [type_id, quantity, state]);

    fit.setActiveDrones(id("Warrior II"), 1);
    expect(drones()).toEqual([
      [id("Hobgoblin II"), 1, "active"],
      [id("Warrior II"), 1, "active"],
      [id("Warrior II"), 2, "offline"],
    ]);

    fit.setActiveDrones(id("Warrior II"), 5);
    expect(drones()).toEqual([
      [id("Hobgoblin II"), 1, "active"],
      [id("Warrior II"), 3, "active"],
    ]);

    fit.setActiveDrones(id("Hobgoblin II"), 0);
    expect(drones()[0]).toEqual([id("Hobgoblin II"), 1, "offline"]);

    const before = fit.getSnapshot();
    fit.setActiveDrones(id("Warrior II"), 3);
    fit.setActiveDrones(id("Hammerhead II"), 1);
    expect(fit.getSnapshot()).toBe(before);
  });

  test("active drones merge every stack of the type where the first one was", () => {
    const warrior = { type_id: id("Warrior II"), slot: { type: "drone_bay" } } as const;
    const fit = engine.createFit({
      ship: { type_id: id("Tristan") },
      items: [
        { ...warrior, state: "offline" },
        { type_id: id("Hobgoblin II"), slot: { type: "drone_bay" }, quantity: 1, state: "active" },
        { ...warrior, quantity: 2, state: "active" },
      ],
    });

    fit.setActiveDrones(id("Warrior II"), 1);
    expect(fit.getSnapshot().fit.items.map(({ type_id, quantity, state }) => [type_id, quantity, state])).toEqual([
      [id("Warrior II"), 1, "active"],
      [id("Warrior II"), 2, "offline"],
      [id("Hobgoblin II"), 1, "active"],
    ]);

    fit.setActiveDrones(id("Warrior II"), -1);
    expect(fit.getSnapshot().fit.items[0]).toMatchObject({ quantity: 3, state: "offline" });
  });

  test("more drones are active while there is room; fewer remove the offline ones first", () => {
    const fit = engine.createFit({ ship: id("Tristan") });
    fit.fit(id("Hobgoblin II"));

    fit.setDroneQuantity(id("Hobgoblin II"), 7);
    expect(stacks(fit)).toEqual([
      [5, "active"],
      [2, "offline"],
    ]);

    fit.setDroneQuantity(id("Hobgoblin II"), 4);
    expect(stacks(fit)).toEqual([[4, "active"]]);

    fit.setDroneQuantity(id("Hobgoblin II"), 0);
    expect(stacks(fit)).toEqual([]);
  });

  test("more drones stop at the bandwidth, next to other types", () => {
    const fit = engine.createFit({
      ship: { type_id: id("Tristan") },
      items: [
        { type_id: id("Hammerhead II"), slot: { type: "drone_bay" }, quantity: 2, state: "active" },
        { type_id: id("Hobgoblin II"), slot: { type: "drone_bay" }, quantity: 1, state: "offline" },
      ],
    });
    fit.setDroneQuantity(id("Hobgoblin II"), 4);
    expect(stacks(fit)).toEqual([
      [2, "active"],
      [1, "active"],
      [3, "offline"],
    ]);

    const before = fit.getSnapshot();
    fit.setDroneQuantity(id("Hobgoblin II"), 4);
    fit.setDroneQuantity(id("Hobgoblin II"), 2.5);
    fit.setDroneQuantity(id("Warrior II"), 3);
    expect(fit.getSnapshot()).toBe(before);
  });

  test("without drone skills, new drones go in offline", () => {
    const fit = engine.createFit({ ship: id("Tristan") });
    fit.setCharacter({ skills: {} });
    fit.fit(id("Hobgoblin I"));
    expect(stacks(fit)).toEqual([[1, "offline"]]);
  });

  test("cargo quantity merges every stack of the type into the first one", () => {
    const paste = { type_id: id("Nanite Repair Paste"), slot: { type: "cargo" } } as const;
    const fit = engine.createFit({
      ship: { type_id: id("Rifter") },
      items: [
        { ...paste, quantity: 10, state: "offline" },
        { type_id: id("EMP S"), slot: { type: "cargo" }, quantity: 100, state: "offline" },
        { ...paste, state: "online" },
        { type_id: id("Hobgoblin II"), slot: { type: "drone_bay" }, quantity: 2, state: "active" },
      ],
    });
    const before = fit.getSnapshot();
    fit.setCargoQuantity(id("Hobgoblin II"), 5);
    fit.setCargoQuantity(id("Nanite Repair Paste"), 2.5);
    expect(fit.getSnapshot()).toBe(before);

    fit.setCargoQuantity(id("Nanite Repair Paste"), 50);
    expect(fit.getSnapshot().fit.items.map(({ type_id, quantity }) => [type_id, quantity])).toEqual([
      [id("Nanite Repair Paste"), 50],
      [id("EMP S"), 100],
      [id("Hobgoblin II"), 2],
    ]);

    fit.setCargoQuantity(id("Nanite Repair Paste"), 0);
    expect(fit.getSnapshot().fit.items).toMatchObject([{ type_id: id("EMP S") }, { type_id: id("Hobgoblin II") }]);
  });

  test("fighter bay quantity merges every stack of the type into the first one", () => {
    const fit = engine.createFit({
      ship: { type_id: id("Thanatos") },
      items: [
        { type_id: id("Templar II"), slot: { type: "fighter_bay" }, quantity: 6, state: "offline" },
        { type_id: id("Templar II"), slot: { type: "fighter_tube", index: 0 }, quantity: 6, state: "active" },
        { type_id: id("Templar II"), slot: { type: "fighter_bay" }, quantity: 2, state: "offline" },
      ],
    });
    fit.setFighterBayQuantity(id("Templar II"), 20);
    expect(stacks(fit)).toEqual([
      [20, "offline"],
      [6, "active"],
    ]);
  });

  test("a squadron in a tube has up to a full squadron, and none removes it", () => {
    const fit = engine.createFit({ ship: id("Thanatos") });
    const squadron = fit.fit(id("Templar II"))!;
    const bay = fit.fit(id("Templar II"), { type: "fighter_bay" })!;
    const before = fit.getSnapshot();
    fit.setSquadronSize(squadron, 9);
    fit.setSquadronSize(bay, 2);
    fit.setSquadronSize(squadron, 2.5);
    expect(fit.getSnapshot()).toBe(before);

    fit.setSquadronSize(squadron, 4);
    expect(stacks(fit)).toEqual([
      [4, "active"],
      [6, "offline"],
    ]);
    fit.setSquadronSize(squadron, 0);
    expect(stacks(fit)).toEqual([[6, "offline"]]);
  });

  test("moving a module swaps it with what is in the other slot", () => {
    const fit = rifter();
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const launcher = fit.fit(id("Rocket Launcher II"))!;
    fit.setCharge(gun, id("EMP S"));
    fit.setState(gun, "offline");

    fit.move(gun, { type: "high", index: 1 });
    expect(fit.getSnapshot().fit.items).toMatchObject([
      { type_id: id("200mm AutoCannon II"), slot: { type: "high", index: 1 }, state: "offline", charge: {} },
      { type_id: id("Rocket Launcher II"), slot: { type: "high", index: 0 } },
    ]);

    fit.move(launcher, { type: "high", index: 2 });
    expect(fit.getSnapshot().fit.items.map((item) => item.slot)).toEqual([
      { type: "high", index: 1 },
      { type: "high", index: 2 },
    ]);
  });

  test("moving a squadron swaps it with what is in the other tube", () => {
    const fit = engine.createFit({ ship: id("Thanatos") });
    const dromi = fit.fit(id("Dromi II"))!;
    const templar = fit.fit(id("Templar II"))!;

    fit.move(dromi, { type: "fighter_tube", index: 1 });
    expect(fit.getSnapshot().fit.items.map((item) => item.slot)).toEqual([
      { type: "fighter_tube", index: 1 },
      { type: "fighter_tube", index: 0 },
    ]);

    fit.move(templar, { type: "fighter_tube", index: 2 });
    expect(fit.getSnapshot().fit.items.map((item) => item.slot)).toEqual([
      { type: "fighter_tube", index: 1 },
      { type: "fighter_tube", index: 2 },
    ]);
  });

  test("a module moves only within its rack, and a subsystem not at all", () => {
    const fit = rifter();
    const gun = fit.fit(id("200mm AutoCannon II"))!;
    const before = fit.getSnapshot();
    fit.move(gun, { type: "medium", index: 0 });
    fit.move(gun, { type: "high", index: 0 });
    fit.move(99, { type: "high", index: 1 });
    expect(fit.getSnapshot()).toBe(before);

    const loki = engine.createFit({ ship: id("Loki") });
    const core = loki.fit(id("Loki Core - Augmented Nuclear Reactor"))!;
    const snapshot = loki.getSnapshot();
    loki.move(core, { type: "subsystem", index: 1 });
    expect(loki.getSnapshot()).toBe(snapshot);
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

function mode(fit: FitStore) {
  return fit.getSnapshot().fit.ship.mode;
}

describe("modes", () => {
  test("a ship with modes starts in the first", () => {
    expect(mode(engine.createFit({ ship: id("Confessor") }))).toBe(id("Confessor Defense Mode"));

    const fit = rifter();
    fit.replace({ ship: { type_id: id("Anhinga") }, items: [] });
    expect(mode(fit)).toBe(id("Anhinga Primary Mode"));
  });

  test("keeps the mode a fit is in, unless its ship does not have it", () => {
    const sharpshooter = id("Confessor Sharpshooter Mode");
    expect(mode(engine.createFit({ ship: { type_id: id("Confessor"), mode: sharpshooter }, items: [] }))).toBe(
      sharpshooter,
    );

    const fit = rifter();
    fit.replace({ ship: { type_id: id("Svipul"), mode: sharpshooter }, items: [] });
    expect(mode(fit)).toBe(id("Svipul Defense Mode"));
    fit.replace({ ship: { type_id: id("Rifter"), mode: sharpshooter }, items: [] });
    expect(fit.getSnapshot().fit.ship).toEqual({ type_id: id("Rifter") });
  });

  test("set to another mode of the ship, which the stats follow", () => {
    const fit = engine.createFit({ ship: id("Confessor") });
    const range = () => fit.getSnapshot().stats.ship.get("maxTargetRange")!;
    const defense = range();

    fit.setMode(id("Confessor Sharpshooter Mode"));
    expect(mode(fit)).toBe(id("Confessor Sharpshooter Mode"));
    expect(range()).toBeCloseTo(defense * 2);

    fit.undo();
    expect(mode(fit)).toBe(id("Confessor Defense Mode"));
  });

  test("not to the mode it is in, nor to a mode of another ship", () => {
    const fit = engine.createFit({ ship: id("Confessor") });
    const before = fit.getSnapshot();
    fit.setMode(id("Confessor Defense Mode"));
    fit.setMode(id("Svipul Sharpshooter Mode"));
    expect(fit.getSnapshot()).toBe(before);
    expect(fit.historyLength).toBe(1);

    const ship = rifter();
    ship.setMode(id("Confessor Defense Mode"));
    expect(ship.historyLength).toBe(1);
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

  test("an edit after going back goes at the end, keeping every fit in between", () => {
    const fit = rifter();
    fit.fit(id("Damage Control II"));
    fit.fit(id("Gyrostabilizer II"));
    fit.goTo(1);
    fit.fit(id("200mm AutoCannon II"));

    expect(fit.historyLength).toBe(4);
    expect(fit.historyPosition).toBe(3);
    expect(fit.canRedo).toBe(false);
    const types = () => fit.getSnapshot().fit.items.map((item) => item.type_id);
    expect(types()).toEqual([id("Damage Control II"), id("200mm AutoCannon II")]);

    fit.undo();
    expect(types()).toEqual([id("Damage Control II"), id("Gyrostabilizer II")]);
  });

  test("going to a fit in the history", () => {
    const fit = rifter();
    fit.fit(id("Damage Control II"));
    fit.fit(id("Gyrostabilizer II"));
    const listener = vi.fn<() => void>();
    fit.subscribe(listener);

    fit.goTo(0);
    expect(fit.getSnapshot().fit.items).toEqual([]);
    expect(fit.historyPosition).toBe(0);
    expect(fit.canRedo).toBe(true);

    fit.goTo(0);
    fit.goTo(5);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("an edit after going back in a full history drops the oldest fit", () => {
    const fit = rifter();
    for (let i = 0; i < 30; i++) fit.setName(`Fit ${i}`);
    fit.goTo(3);
    fit.setName("Kiter");

    expect(fit.historyLength).toBe(25);
    expect(fit.historyPosition).toBe(24);
    fit.goTo(0);
    expect(fit.getSnapshot().fit.name).toBe("Fit 6");
  });

  test("a position not in the history goes nowhere", () => {
    const fit = rifter();
    fit.setName("Brawler");
    const before = fit.getSnapshot();

    fit.goTo(-1);
    fit.goTo(0.5);
    fit.goTo(2);
    expect(fit.getSnapshot()).toBe(before);
  });

  test("the oldest fits drop out of a full history", () => {
    const fit = rifter();
    for (let i = 0; i < 30; i++) fit.setName(`Fit ${i}`);

    expect(fit.historyLength).toBe(25);
    fit.goTo(0);
    expect(fit.getSnapshot().fit.name).toBe("Fit 5");
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

  test("removing several items is one step", () => {
    const fit = rifter();
    fit.fit(id("Nanite Repair Paste"), { type: "cargo" });
    fit.fit(id("200mm AutoCannon II"));
    fit.fit(id("Damage Control II"));
    fit.remove(0, 2);
    expect(fit.getSnapshot().fit.items).toMatchObject([{ type_id: id("200mm AutoCannon II") }]);

    fit.undo();
    expect(fit.getSnapshot().fit.items).toHaveLength(3);
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
