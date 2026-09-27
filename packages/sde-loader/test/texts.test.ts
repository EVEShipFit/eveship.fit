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
