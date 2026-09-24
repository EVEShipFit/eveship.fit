import { beforeAll, describe, expect, test } from "vitest";

import { loadSde, type Sde } from "../src/index.js";
import { readSdeFile } from "./files.js";

const RIFTER = 587;

let sde: Sde;
beforeAll(async () => {
  sde = await loadSde({ bytes: readSdeFile("sde.dat") });
});

test("rejects a file that is not an SDE", async () => {
  await expect(loadSde({ bytes: new Uint8Array(64) })).rejects.toThrow("Not an SDE file");
});

test("keeps the bytes for the engine", () => {
  expect(sde.bytes.byteLength).toBeGreaterThan(1_000_000);
  expect(sde.buildNumber).toBeGreaterThan(0);
});

describe("lookups", () => {
  test("type", () => {
    const rifter = sde.type(RIFTER)!;
    expect(rifter).toMatchObject({ id: RIFTER, name: "Rifter", categoryId: 6, published: true, factionId: 500002 });
    expect(sde.type(RIFTER)).toBe(rifter);
  });

  test("type attributes and effects", () => {
    const rifter = sde.type(RIFTER)!;
    expect(rifter.attributes.get(sde.attributeId("hiSlots")!)).toBe(3);
    expect(rifter.effectIds.size).toBeGreaterThan(0);
  });

  test("the ones around a type", () => {
    const rifter = sde.type(RIFTER)!;
    expect(sde.group(rifter.groupId)?.name).toBe("Frigate");
    expect(sde.category(rifter.categoryId)?.name).toBe("Ship");
    expect(sde.marketGroup(rifter.marketGroupId!)?.name).toBeTruthy();
    expect(sde.metaGroup(rifter.metaGroupId!)?.name).toBe("Tech I");
  });

  test("attribute, effect and unit", () => {
    const cpuOutput = sde.attribute(48)!;
    expect(cpuOutput.name).toBe("cpuOutput");
    expect(sde.unit(cpuOutput.unitId)?.displayName).toBe("tf");
    expect(sde.effect(11)).toMatchObject({ name: "loPower", category: "passive" });
  });

  test("the engine's own attributes have negative IDs", () => {
    expect(sde.attribute(-1)?.name).toBe("alignTime");
    expect(sde.attributeId("alignTime")).toBe(-1);
  });

  test("misses", () => {
    expect(sde.type(-12345)).toBeUndefined();
    expect(sde.type(999_999_999)).toBeUndefined();
    expect(sde.attributeId("noSuchAttribute")).toBeUndefined();
  });

  test("by name", () => {
    expect(sde.attributeId("cpuOutput")).toBe(48);
    expect(sde.typeByName("Rifter")?.id).toBe(RIFTER);
    expect(sde.typeByName("rifter")).toBeUndefined();
  });
});

describe("trees", () => {
  test("market", () => {
    const roots = sde.marketTree();
    const ships = roots.find((node) => node.group.name === "Ships")!;
    expect(ships.children.length).toBeGreaterThan(0);
    expect(roots.every((node) => node.group.parentGroupId === undefined)).toBe(true);

    const names = roots.map((node) => node.group.name);
    expect(names).toEqual(names.toSorted((a, b) => new Intl.Collator("en").compare(a, b)));
  });

  test("ships by group and race", () => {
    const frigates = sde.shipTree().find((node) => node.group.name === "Frigate")!;
    expect(frigates.races.map((node) => node.race)).toEqual(["amarr", "caldari", "gallente", "minmatar", "other"]);

    const minmatar = frigates.races.find((node) => node.race === "minmatar")!;
    expect(minmatar.ships.map((ship) => ship.name)).toContain("Rifter");
    expect(minmatar.ships.every((ship) => ship.published && ship.categoryId === 6)).toBe(true);
  });
});
