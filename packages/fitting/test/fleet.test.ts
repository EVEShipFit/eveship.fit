import { beforeAll, describe, expect, test } from "vitest";

import { burstsOf, type Engine, type Fit, type FitStore } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

let engine: Engine;
let id: (name: string) => number;
let claymore: Fit;
beforeAll(async () => {
  engine = await testEngine();
  id = (name) => typeIdOf(engine, name);
  claymore = engine.loadText(
    "[Claymore, Shield Boosts]\nShield Command Burst II, Shield Harmonizing Charge\nShield Command Burst II, Active Shielding Charge\n",
  );
});

function rifter(): FitStore {
  return engine.createFit({ ship: id("Rifter") });
}

const shieldEm = (fit: FitStore) => fit.getSnapshot().stats.ship.get("shieldEmDamageResonance")!;

describe("boosters", () => {
  test("go in as an edit, without their character or their own boosters", () => {
    const fit = rifter();
    fit.addBooster({ ...claymore, character: { skills: {} }, boosters: [{ fit: claymore }] });

    const [booster] = fit.getSnapshot().fit.boosters!;
    expect(booster!.fit.character).toBeUndefined();
    expect(booster!.fit.boosters).toBeUndefined();
    expect(fit.canUndo).toBe(true);

    fit.undo();
    expect(fit.getSnapshot().fit.boosters).toBeUndefined();
  });

  test("boost the fit, and say which booster and charge each buff came from", () => {
    const fit = rifter();
    const unboosted = shieldEm(fit);
    fit.addBooster(claymore);

    const snapshot = fit.getSnapshot();
    expect(shieldEm(fit)).toBeLessThan(unboosted);
    expect(snapshot.unboosted?.ship.get("shieldEmDamageResonance")).toBe(unboosted);
    expect(snapshot.boosts.buffs).toContainEqual(
      expect.objectContaining({ booster: 0, charge: id("Shield Harmonizing Charge") }),
    );
    expect(snapshot.boosts.boosters[0]).toMatchObject({ landed: true });
    expect(snapshot.boosts.boosters[0]!.bursts.map((burst) => burst.charge)).toEqual([
      id("Shield Harmonizing Charge"),
      id("Active Shielding Charge"),
    ]);
  });

  test("an off booster stays, without boosting", () => {
    const fit = rifter();
    const unboosted = shieldEm(fit);
    fit.addBooster(claymore);
    fit.setBoosterOff(0, true);

    const snapshot = fit.getSnapshot();
    expect(snapshot.fit.boosters).toEqual([{ fit: expect.anything(), off: true }]);
    expect(shieldEm(fit)).toBe(unboosted);
    expect(snapshot.unboosted).toBeUndefined();
    expect(snapshot.boosts.buffs).toEqual([]);
    expect(snapshot.boosts.boosters[0]).toMatchObject({ landed: false });

    fit.setBoosterOff(0, false);
    expect(fit.getSnapshot().fit.boosters).toEqual([{ fit: expect.anything() }]);
  });

  test("a weaker booster of the same buff does not land", () => {
    const fit = rifter();
    const weaker = engine.loadText("[Claymore, Weaker]\nShield Command Burst I, Shield Harmonizing Charge\n");
    fit.addBooster(weaker);
    fit.addBooster(claymore);

    const { boosters } = fit.getSnapshot().boosts;
    expect(boosters.map((booster) => booster.landed)).toEqual([false, true]);
  });

  test("switching them all off is not an edit, and applies to a preview", () => {
    const fit = rifter();
    const unboosted = shieldEm(fit);
    fit.addBooster(claymore);
    const position = fit.historyPosition;

    fit.setBoosts(false);
    expect(fit.boosts).toBe(false);
    expect(shieldEm(fit)).toBe(unboosted);
    expect(fit.getSnapshot().boosts).toMatchObject({ on: false, buffs: [] });
    expect(fit.historyPosition).toBe(position);
    expect(fit.preview((draft) => draft.setName("Draft")).after.stats.ship.get("shieldEmDamageResonance")).toBe(
      unboosted,
    );

    fit.setBoosts(true);
    expect(shieldEm(fit)).toBeLessThan(unboosted);
  });

  test("removing the last leaves no boosters", () => {
    const fit = rifter();
    fit.addBooster(claymore);
    fit.addBooster(claymore);
    fit.removeBooster(0);
    expect(fit.getSnapshot().fit.boosters).toHaveLength(1);
    fit.removeBooster(0);
    expect(fit.getSnapshot().fit).not.toHaveProperty("boosters");
  });

  test("stay in a link", async () => {
    const fit = rifter();
    fit.addBooster(claymore);
    fit.setBoosterOff(0, true);

    const loaded = await engine.loadLink(engine.saveLink(fit.getSnapshot().fit));
    expect(loaded.boosters).toEqual([{ fit: expect.objectContaining({ ship: claymore.ship }), off: true }]);
  });
});

test("the bursts of a fit are the modules loaded with a buff charge", () => {
  const bursts = burstsOf(engine.sde, claymore);
  expect(bursts).toEqual([
    {
      ref: 0,
      module: id("Shield Command Burst II"),
      charge: id("Shield Harmonizing Charge"),
      buffs: [expect.any(Number)],
    },
    { ref: 1, module: id("Shield Command Burst II"), charge: id("Active Shielding Charge"), buffs: expect.any(Array) },
  ]);
});
