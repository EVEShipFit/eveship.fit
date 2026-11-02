import type { DynamicItem, Esi } from "@eveshipfit/esi";
import { beforeAll, describe, expect, test } from "vitest";

import {
  canMutate,
  Engine,
  mutaplasmidsOf,
  mutationRanges,
  mutationRollOf,
  parseItemLink,
  rollMutation,
  type FitStore,
  type MutationRoll,
} from "../src/index.js";
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

  test("not drones", () => {
    const drone = engine.sde.type(id("Hobgoblin II"))!;
    expect(engine.sde.mutaplasmidsFor(drone.id).length).toBeGreaterThan(0);
    expect(canMutate(engine.sde, drone)).toBe(false);
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
