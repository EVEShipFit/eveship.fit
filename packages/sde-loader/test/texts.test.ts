import { beforeAll, expect, test } from "vitest";

import { loadSde, loadTexts, type Sde, type Texts } from "../src/index.js";
import { readSdeFile } from "./files.js";

let sde: Sde;
let texts: Texts;
beforeAll(async () => {
  [sde, texts] = await Promise.all([
    loadSde({ bytes: readSdeFile("sde.dat") }),
    loadTexts({ bytes: readSdeFile("texts.dat") }),
  ]);
});

test("rejects a file that is not a texts file", async () => {
  await expect(loadTexts({ bytes: new Uint8Array(64) })).rejects.toThrow("Not a texts file");
});

test("comes from the same SDE build", () => {
  expect(texts.buildNumber).toBe(sde.buildNumber);
  expect(texts.releaseDate).toEqual(sde.releaseDate);
});

test("the tooltip of an attribute", () => {
  expect(texts.attributeTooltip(sde.attributeId("scanGravimetricStrength")!)).toEqual({
    title: "Gravimetric Sensor Strength",
    description: "Larger values reduce the chance of being jammed by ECM and assist in avoiding detection by probes",
  });
});

test("most attributes have no tooltip", () => {
  expect(texts.attributeTooltip(sde.attributeId("shieldEmDamageResonance")!)).toBeUndefined();
});

test("the bonuses of a ship, in the order EVE shows them", () => {
  const bonuses = texts.typeBonuses(sde.typeByName("Hecate")!.id)!;
  expect(bonuses.skills).toHaveLength(1);
  expect(bonuses.role).toEqual([]);
  expect(bonuses.misc[0]).toEqual({
    bonus: 33,
    unitId: 105,
    text: "bonus to <a href=showinfo:3301>Small Hybrid Turret</a> damage",
  });
  expect(bonuses.misc[3]).toEqual({ bonus: undefined, unitId: 0, text: "<b><u>Defense Mode</b></u>" });
});

test("most types have no bonuses", () => {
  expect(texts.typeBonuses(sde.typeByName("Hobgoblin II")!.id)).toBeUndefined();
});
