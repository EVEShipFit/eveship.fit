import type { DynamicItem, Esi } from "@eveshipfit/esi";
import { beforeAll, describe, expect, test } from "vitest";

import {
  canMutate,
  distinctRolls,
  Engine,
  mutatedDronesOf,
  mutaplasmidsOf,
  mutationRanges,
  mutationRollOf,
  parseItemLink,
  parseMutationText,
  rollMutation,
  type FitStore,
  type MutationRoll,
  type RollKind,
} from "../src/index.js";
import { loadLink, saveLink } from "../src/link.js";
import { loadText, saveText } from "../src/text.js";
import { testEngine, typeIdOf } from "./engine.js";

let engine: Engine;
let id: (name: string) => number;
let attribute: (name: string) => number;
let extender: number;
let gravid: number;
let decayed: number;
beforeAll(async () => {
  engine = await testEngine();
  id = (name) => typeIdOf(engine, name);
  attribute = (name) => engine.sde.attributeId(name)!;
  extender = id("Large Shield Extender II");
  gravid = id("Gravid Large Shield Extender Mutaplasmid");
  decayed = id("Decayed Large Shield Extender Mutaplasmid");
});

function drakeWithExtender(): FitStore {
  const fit = engine.createFit({ ship: id("Drake") });
  fit.fit(extender);
  return fit;
}

function shieldOf(fit: FitStore): number {
  return fit.getSnapshot().stats.ship.get(attribute("shieldCapacity"))!;
}

describe("ranges", () => {
  test("in the attribute's own values, around the base", () => {
    const shield = mutationRanges(engine.sde, extender, gravid).find(
      (range) => range.attributeId === attribute("capacityBonus"),
    );

    expect(shield).toEqual({
      attributeId: attribute("capacityBonus"),
      base: 2600,
      min: expect.closeTo(2340),
      max: expect.closeTo(3120),
      highIsGood: true,
    });
  });

  test("best and worst follow whether a high value is good", () => {
    const best = rollMutation(engine.sde, extender, gravid, "best").attributes;
    const worst = rollMutation(engine.sde, extender, gravid, "worst").attributes;

    expect(best[attribute("capacityBonus")]).toBeGreaterThan(worst[attribute("capacityBonus")]!);
    expect(best[attribute("cpu")]).toBeLessThan(worst[attribute("cpu")]!);
  });

  test("a random roll lands in each range", () => {
    const rolled = rollMutation(engine.sde, extender, gravid, "random", () => 0.5).attributes;

    for (const range of mutationRanges(engine.sde, extender, gravid)) {
      expect(rolled[range.attributeId]).toBeCloseTo((range.min + range.max) / 2);
    }
  });
});

describe("setMutation", () => {
  test("the roll counts in the fit", () => {
    const fit = drakeWithExtender();
    const before = shieldOf(fit);

    fit.setMutation(0, { base: extender, mutaplasmid: gravid, attributes: { [attribute("capacityBonus")]: 3000 } });

    const item = fit.getSnapshot().fit.items[0]!;
    expect(item.type_id).toBe(id("Large Abyssal Shield Extender"));
    expect(item.mutation?.base).toBe(extender);
    expect(shieldOf(fit) - before).toBeCloseTo(400 * 1.25, 0);
  });

  test("an attribute left out is at its base value", () => {
    const fit = drakeWithExtender();

    fit.setMutation(0, { base: extender, mutaplasmid: gravid, attributes: { [attribute("capacityBonus")]: 3000 } });

    const rolled = fit.getSnapshot().fit.items[0]!.mutation!.attributes as Record<number, number>;
    expect(rolled[attribute("cpu")]).toBe(engine.sde.type(extender)!.attributes.get(attribute("cpu")));
    expect(Object.keys(rolled)).toHaveLength(mutationRanges(engine.sde, extender, gravid).length);
  });

  test("only a roll of the module itself", () => {
    const fit = drakeWithExtender();
    const before = fit.getSnapshot();

    fit.setMutation(0, rollMutation(engine.sde, id("Large Shield Extender I"), gravid, "best"));

    expect(fit.getSnapshot()).toBe(before);
  });

  test("undefined turns it back into the module it was", () => {
    const fit = drakeWithExtender();
    const before = fit.getSnapshot().fit;
    fit.setMutation(0, rollMutation(engine.sde, extender, gravid, "best"));

    fit.setMutation(0, undefined);

    expect(fit.getSnapshot().fit.items).toEqual(before.items);
  });

  test("the same roll again changes nothing", () => {
    const fit = drakeWithExtender();
    fit.setMutation(0, rollMutation(engine.sde, extender, gravid, "best"));
    const before = fit.getSnapshot();

    fit.setMutation(0, rollMutation(engine.sde, extender, gravid, "best"));

    expect(fit.getSnapshot()).toBe(before);
  });

  test("a mutaplasmid that does not work on the module changes nothing", () => {
    const fit = drakeWithExtender();
    const before = fit.getSnapshot();

    fit.setMutation(0, { base: id("Damage Control II"), mutaplasmid: gravid, attributes: {} });

    expect(fit.getSnapshot()).toBe(before);
  });

  test("the roll survives a link", async () => {
    const fit = drakeWithExtender();
    const roll = rollMutation(engine.sde, extender, gravid, "best");
    fit.setMutation(0, roll);

    const loaded = engine.createFit(await engine.loadLink(engine.saveLink(fit.getSnapshot().fit)));

    expect(shieldOf(loaded)).toBeCloseTo(shieldOf(fit));
  });

  test("replacing the fit with another roll is a change", async () => {
    const linked = async (kind: "best" | "worst") => {
      const fit = drakeWithExtender();
      fit.setMutation(0, rollMutation(engine.sde, extender, gravid, kind));
      return engine.loadLink(engine.saveLink(fit.getSnapshot().fit));
    };
    const fit = engine.createFit(await linked("best"));
    const before = shieldOf(fit);

    fit.replace(await linked("worst"));

    expect(shieldOf(fit)).toBeLessThan(before);
  });
});

describe("fitMutated", () => {
  test("fits and mutates in one step of the history", () => {
    const fit = engine.createFit({ ship: id("Drake") });

    const ref = fit.fitMutated(rollMutation(engine.sde, extender, gravid, "best"));

    expect(fit.getSnapshot().fit.items[ref!]?.type_id).toBe(id("Large Abyssal Shield Extender"));
    expect(fit.historyLength).toBe(2);
  });

  test("nothing when it does not fit", () => {
    const fit = engine.createFit({ ship: id("Drake") });

    expect(fit.fitMutated({ base: extender, mutaplasmid: id("Rifter"), attributes: {} })).toBeUndefined();
    expect(fit.historyLength).toBe(1);
  });
});

describe("canMutate", () => {
  test("modules with a mutaplasmid", () => {
    expect(canMutate(engine.sde, engine.sde.type(extender)!)).toBe(true);
    expect(canMutate(engine.sde, engine.sde.type(id("200mm AutoCannon II"))!)).toBe(false);
  });

  test("drones with a mutaplasmid", () => {
    expect(canMutate(engine.sde, engine.sde.type(id("Hobgoblin II"))!)).toBe(true);
  });

  test("mutaplasmids, the one that rolls least first", () => {
    const names = mutaplasmidsOf(engine.sde, extender).map(({ id: typeId }) => engine.sde.type(typeId)?.name);
    expect(names[0]).toBe("Decayed Large Shield Extender Mutaplasmid");
    expect(names.at(-1)).toBe("Glorified Unstable Large Shield Extender Mutaplasmid");
  });
});

describe("mutationRollOf", () => {
  test("the narrowest mutaplasmid that could have rolled it", () => {
    const fit = drakeWithExtender();
    fit.setMutation(0, rollMutation(engine.sde, extender, gravid, "base"));

    expect(mutationRollOf(engine.sde, fit.getSnapshot().fit.items[0]!)?.mutaplasmid).toBe(decayed);
  });

  test("a value only a wider one reaches picks that one", () => {
    const fit = drakeWithExtender();
    fit.setMutation(0, rollMutation(engine.sde, extender, gravid, "best"));

    const roll = mutationRollOf(engine.sde, fit.getSnapshot().fit.items[0]!);

    expect(roll?.mutaplasmid).toBe(gravid);
    expect(roll?.attributes[attribute("capacityBonus")]).toBeCloseTo(3120);
  });

  test("none for a module that is not mutated", () => {
    expect(mutationRollOf(engine.sde, drakeWithExtender().getSnapshot().fit.items[0]!)).toBeUndefined();
  });
});

describe("parseItemLink", () => {
  test("an in-game item link", () => {
    expect(parseItemLink("<url=showinfo:47808//1043219876543>Large Abyssal Shield Extender</url>")).toEqual({
      typeId: 47808,
      itemId: 1043219876543,
    });
  });

  test("the type ID and item ID", () => {
    expect(parseItemLink("47808 1043219876543")).toEqual({ typeId: 47808, itemId: 1043219876543 });
    expect(parseItemLink("47808/1043219876543")).toEqual({ typeId: 47808, itemId: 1043219876543 });
  });

  test("anything else", () => {
    expect(parseItemLink("[Drake, Shield]")).toBeUndefined();
    expect(parseItemLink("47808")).toBeUndefined();
    expect(parseItemLink("587:2")).toBeUndefined();
  });
});

describe("parseMutationText", () => {
  const sink = `Entropic Radiation Sink II
Gravid Entropic Radiation Sink Mutaplasmid
cpu 27.876000337600708, damageMultiplier 1.1440403131908177, speedMultiplier 0.9305765089869499, dpsIncreaseTurrets 1.2293887736713343`;

  test("a module as Pyfa copies it, without the stats EVE does not have", () => {
    expect(parseMutationText(engine.sde, sink)).toEqual({
      base: id("Entropic Radiation Sink II"),
      mutaplasmid: id("Gravid Entropic Radiation Sink Mutaplasmid"),
      attributes: {
        [attribute("cpu")]: 27.876000337600708,
        [attribute("damageMultiplier")]: 1.1440403131908177,
        [attribute("speedMultiplier")]: 0.9305765089869499,
      },
    });
  });

  test("a section of Pyfa's EFT, and a stat left out at its base value", () => {
    const roll = parseMutationText(
      engine.sde,
      `[1] Large Shield Extender II\n  Gravid Large Shield Extender Mutaplasmid\n  cpu 40`,
    );

    expect(roll?.attributes[attribute("cpu")]).toBe(40);
    expect(roll?.attributes[attribute("capacityBonus")]).toBe(2600);
  });

  test("anything else", () => {
    expect(parseMutationText(engine.sde, "Large Shield Extender II")).toBeUndefined();
    expect(
      parseMutationText(engine.sde, "Large Shield Extender II\nGravid Entropic Radiation Sink Mutaplasmid"),
    ).toBeUndefined();
    expect(
      parseMutationText(engine.sde, "[Drake, Shield]\nLarge Shield Extender II\nDamage Control II"),
    ).toBeUndefined();
  });
});

describe("loadText", () => {
  test("a Pyfa fit with a mutated module, stats EVE does not have left out", () => {
    const fit = engine.loadText(`[Punisher, Pyfa]

Entropic Radiation Sink II [1]

[1] Entropic Radiation Sink II
  Gravid Entropic Radiation Sink Mutaplasmid
  cpu 27.876000337600708, damageMultiplier 1.1440403131908177, speedMultiplier 0.9305765089869499, dpsIncreaseTurrets 1.2293887736713343
`);

    const item = fit.items[0]!;
    expect(item.mutation?.base).toBe(id("Entropic Radiation Sink II"));
    expect(mutationRollOf(engine.sde, item)?.mutaplasmid).toBe(id("Gravid Entropic Radiation Sink Mutaplasmid"));
  });
});

describe("loadMutation", () => {
  test("only the rolled attributes, from ESI", async () => {
    const item: DynamicItem = {
      created_by: 1,
      source_type_id: extender,
      mutator_type_id: gravid,
      dogma_attributes: [
        { attribute_id: attribute("capacityBonus"), value: 3000 },
        { attribute_id: attribute("mass"), value: 1 },
      ],
      dogma_effects: [],
    };
    const esi = { dynamicItem: () => Promise.resolve(item) } as unknown as Esi;

    const roll = await new Engine(engine.sde, esi).loadMutation(47808, 1);

    expect(roll).toEqual<MutationRoll>({
      base: extender,
      mutaplasmid: gravid,
      attributes: { [attribute("capacityBonus")]: 3000 },
    });
  });
});

function bay(fit: FitStore) {
  return fit.getSnapshot().fit.items.map(({ quantity, state }) => [quantity, state]);
}

describe("mutated drones", () => {
  let hobgoblin: number;
  let firepower: number;

  beforeAll(() => {
    hobgoblin = id("Hobgoblin II");
    firepower = id("Exigent Light Drone Firepower Mutaplasmid");
  });

  const roll = (kind: RollKind) => rollMutation(engine.sde, hobgoblin, firepower, kind);
  const drones = (fit: FitStore) => mutatedDronesOf(engine.sde, fit.getSnapshot().fit, hobgoblin)!;

  function vexorWith(count: number): FitStore {
    const fit = engine.createFit({ ship: id("Vexor") });
    for (let drone = 0; drone < count; drone++) fit.fit(hobgoblin);
    return fit;
  }

  function mutated(count: number): FitStore {
    const fit = vexorWith(count);
    fit.setDronesMutation([0], roll("base"));
    return fit;
  }

  test("a row mutates as a whole, in one step of the history", () => {
    const fit = vexorWith(3);
    const before = fit.historyLength;

    fit.setDronesMutation([0], roll("best"));

    expect(fit.historyLength).toBe(before + 1);
    expect(drones(fit).rolls).toHaveLength(3);
    expect(distinctRolls(drones(fit).rolls)).toBe(1);
  });

  test("every drone can have its own roll, and only those change", () => {
    const fit = mutated(3);
    const { rolls } = drones(fit);

    fit.setMutatedDrones(hobgoblin, rolls.with(1, roll("best")));

    expect(distinctRolls(drones(fit).rolls)).toBe(2);
    expect(bay(fit)).toEqual([
      [1, "active"],
      [1, "active"],
      [1, "active"],
    ]);
    expect(drones(fit).rolls[0]!.attributes).toEqual(rolls[0]!.attributes);
  });

  test("the stats follow each drone's roll", () => {
    const fit = mutated(2);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst")]);
    const damage = fit.getSnapshot().stats.items.map((item) => item.attributes.get("damageMultiplier")!);

    expect(damage[0]).toBeGreaterThan(damage[1]!);
  });

  test("the same roll stacks again", () => {
    const fit = mutated(3);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst"), roll("worst")]);
    expect(fit.getSnapshot().fit.items).toHaveLength(2);

    fit.setMutatedDrones(
      hobgoblin,
      drones(fit).rolls.map(() => roll("best")),
    );

    expect(bay(fit)).toEqual([[3, "active"]]);
  });

  test("launching keeps the rolls, the first ones first", () => {
    const fit = mutated(3);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst"), roll("worst")]);
    const { rolls } = drones(fit);

    fit.setActiveMutatedDrones(hobgoblin, 1);

    expect(drones(fit).active).toBe(1);
    expect(drones(fit).rolls).toEqual(rolls);
    expect(bay(fit)).toEqual([
      [1, "active"],
      [2, "offline"],
    ]);
  });

  test("more drones copy the last roll, fewer drop the last ones", () => {
    const fit = mutated(2);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst")]);

    fit.setMutatedDroneQuantity(hobgoblin, 4);
    expect(drones(fit).rolls).toHaveLength(4);
    expect(drones(fit).rolls[3]!.attributes).toEqual(drones(fit).rolls[1]!.attributes);

    fit.setMutatedDroneQuantity(hobgoblin, 1);
    expect(distinctRolls(drones(fit).rolls)).toBe(1);
    expect(drones(fit).rolls).toHaveLength(1);
  });

  test("an edit that changes nothing is not in the history", () => {
    const fit = mutated(2);
    const before = fit.historyLength;

    fit.setMutatedDrones(hobgoblin, drones(fit).rolls);

    expect(fit.historyLength).toBe(before);
  });

  test("an edit that changes nothing is not in the history, however the drones are stacked", () => {
    const fit = engine.createFit({ ship: id("Vexor") });
    fit.fitMutated(roll("best"));
    fit.fitMutated(roll("best"));
    const before = fit.historyLength;

    fit.setMutatedDrones(hobgoblin, drones(fit).rolls);

    expect(fit.historyLength).toBe(before);
  });

  test("a new drone launches, not an idle one before it", () => {
    const fit = mutated(3);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst"), roll("base")]);
    fit.setActiveMutatedDrones(hobgoblin, 1);
    const { rolls } = drones(fit);

    fit.setMutatedDroneQuantity(hobgoblin, 4);

    expect(drones(fit).active).toBe(2);
    expect(drones(fit).rolls[1]!.attributes).toEqual(rolls[2]!.attributes);
    expect(drones(fit).rolls[2]!.attributes).toEqual(rolls[1]!.attributes);
  });

  test("each drone keeps a mutaplasmid that can roll it", () => {
    const fit = mutated(2);
    const durability = id("Exigent Light Drone Durability Mutaplasmid");
    fit.setMutatedDrones(hobgoblin, [roll("best"), rollMutation(engine.sde, hobgoblin, durability, "best")]);

    expect(drones(fit).rolls.map(({ mutaplasmid }) => mutaplasmid)).toEqual([firepower, durability]);
  });

  test("no mutated drone on a ship without a drone bay", () => {
    const fit = engine.createFit({ ship: id("Rifter") });

    expect(fit.fitMutated(roll("best"))).toBeUndefined();
    expect(fit.getSnapshot().fit.items).toHaveLength(0);
  });

  test("removing the mutation gives plain drones back", () => {
    const fit = mutated(2);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("worst")]);

    fit.setDronesMutation(drones(fit).refs, undefined);

    const { items } = fit.getSnapshot().fit;
    expect(items.every(({ type_id, mutation }) => type_id === hobgoblin && mutation === undefined)).toBe(true);
  });

  test("a mutated drone is added next to plain ones, not over them", () => {
    const fit = vexorWith(2);

    fit.fitMutated(roll("best"));

    expect(drones(fit).rolls).toHaveLength(1);
    expect(fit.getSnapshot().fit.items[0]!.type_id).toBe(hobgoblin);
    expect(fit.getSnapshot().fit.items[0]!.quantity).toBe(2);
  });

  test.each(["link", "esf"])("different rolls survive the %s format, equal ones stack", async (format) => {
    const fit = mutated(3);
    fit.setMutatedDrones(hobgoblin, [roll("best"), roll("best"), roll("worst")]);
    const saved = fit.getSnapshot().fit;
    const character = fit.character;

    const loaded =
      format === "link"
        ? await loadLink(saveLink(saved), undefined, character)
        : loadText(saveText(saved, "esf"), character);

    expect(loaded.items.map(({ quantity }) => quantity)).toEqual([2, 1]);
    const back = mutatedDronesOf(engine.sde, loaded, hobgoblin)!;
    expect(back.rolls.map(({ attributes }) => attributes)).toEqual(
      drones(fit).rolls.map(({ attributes }) => attributes),
    );
  });
});
