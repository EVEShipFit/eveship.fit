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

test("knows when its SDE build was released", () => {
  expect(sde.releaseDate?.getTime()).toBeGreaterThan(Date.UTC(2026, 0, 1));
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

  test("types by group, category and market group", () => {
    const rifter = sde.type(RIFTER)!;
    const frigates = sde.typesInGroup(rifter.groupId);
    expect(frigates).toContain(rifter);
    expect(frigates.every((type) => type.groupId === rifter.groupId)).toBe(true);
    expect(frigates.map((type) => type.id)).toEqual(frigates.map((type) => type.id).toSorted((a, b) => a - b));

    const ships = sde.typesInCategory(rifter.categoryId);
    expect(ships).toContain(rifter);
    expect(ships.every((type) => type.categoryId === rifter.categoryId)).toBe(true);

    expect(sde.typesInMarketGroup(rifter.marketGroupId!)).toContain(rifter);
    expect(sde.typesInGroup(-1)).toEqual([]);
  });

  test("the modes of a ship", () => {
    const svipul = sde.typeByName("Svipul")!;
    expect(new Set(svipul.modeTypeIds.map((id) => sde.type(id)?.name))).toEqual(
      new Set(["Svipul Defense Mode", "Svipul Propulsion Mode", "Svipul Sharpshooter Mode"]),
    );
    expect(sde.type(RIFTER)!.modeTypeIds).toEqual([]);
  });

  test("attribute, effect and unit", () => {
    const cpuOutput = sde.attribute(48)!;
    expect(cpuOutput.name).toBe("cpuOutput");
    expect(sde.unit(cpuOutput.unitId)?.displayName).toBe("tf");
    expect(sde.effect(11)).toMatchObject({ name: "loPower", category: "passive" });
  });

  test("fighter abilities, with the effect each one is", () => {
    const einherji = sde.typeByName("Einherji I")!;
    const abilities = einherji.fighterAbilities.map(({ abilityId }) => sde.fighterAbility(abilityId));
    expect(abilities.map((ability) => ability?.name)).toEqual(["Autocannon", "Microwarpdrive", "Heavy Rocket Salvo"]);
    expect(abilities.map((ability) => sde.effect(ability!.effectId)?.name)).toEqual([
      "fighterAbilityAttackM",
      "fighterAbilityMicroWarpDrive",
      "fighterAbilityMissiles",
    ]);
    expect(sde.fighterAbility(-1)).toBeUndefined();
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

  test("modules", () => {
    const roots = sde.moduleTree();
    const names = roots.map((node) => node.group.name);
    expect(names).toContain("Hull & Armor");
    expect(names).toContain("Drones");
    expect(names).toContain("Rigs");
    expect(names).toContain("Subsystems");
    expect(names).toContain("Structure Equipment");
    expect(names).toContain("Structure Modifications");
    expect(names).not.toContain("Ship Equipment");
    expect(names).toEqual(names.toSorted((a, b) => new Intl.Collator("en").compare(a, b)));

    const large = roots
      .find((node) => node.group.name === "Hull & Armor")!
      .children.find((node) => node.group.name === "Remote Armor Repairers")!
      .children.find((node) => node.group.name === "Large")!;
    expect(large.types.map((type) => type.name)).toEqual([
      "Large Ancillary Remote Armor Repairer",
      "Large Remote Armor Repairer I",
      "Large Coaxial Compact Remote Armor Repairer",
      "Large I-ax Enduring Remote Armor Repairer",
      "Large Solace Scoped Remote Armor Repairer",
      "Large Remote Armor Repairer II",
    ]);
    expect(large.folders.map((node) => node.folder)).toEqual(["faction"]);
    expect(large.folders[0]!.types.every((type) => type.metaGroupId === 3 || type.metaGroupId === 4)).toBe(true);
  });

  test("structure modules sort as their ship counterparts do", () => {
    const structureFighters = sde
      .moduleTree()
      .find((node) => node.group.name === "Drones")!
      .children.find((node) => node.group.name === "Fighters")!
      .children.find((node) => node.group.name === "Structure-based Fighters")!;
    for (const { types } of structureFighters.children) {
      const techs = types.map((type) => type.metaGroupId);
      expect(techs).toEqual(techs.toSorted((a, b) => (b ?? 0) - (a ?? 0)));
    }
    const folders = structureFighters.children.flatMap((node) => node.folders);
    expect(folders.map((node) => node.folder)).toContain("faction");
    expect(
      structureFighters.children.some(({ types }) => new Set(types.map((type) => type.metaGroupId)).size > 1),
    ).toBe(true);
    expect(folders.flatMap((node) => node.types).every((type) => type.metaGroupId === 52)).toBe(true);
  });

  test("module search, by root market group", () => {
    const roots = sde.moduleSearch();
    const names = roots.map((node) => node.group.name);
    expect(names).toEqual(expect.arrayContaining(["Drones", "Ship Equipment", "Structure Equipment"]));
    expect(names).toEqual(names.toSorted((a, b) => new Intl.Collator("en").compare(a, b)));
    expect(roots.every((node) => node.group.parentGroupId === undefined && node.children.length === 0)).toBe(true);

    const all = roots.flatMap((node) => [...node.types, ...node.folders.flatMap((folder) => folder.types)]);
    expect(new Set(all.map((type) => sde.category(type.categoryId)?.name))).toEqual(
      new Set(["Module", "Drone", "Subsystem", "Structure Module", "Fighter"]),
    );

    const smartbombs = roots
      .find((node) => node.group.name === "Ship Equipment")!
      .types.filter((type) => type.name.includes("Smartbomb"))
      .map((type) => type.name);
    expect(smartbombs.slice(0, 2)).toEqual([
      "'Concussion' Compact Large Graviton Smartbomb",
      "'Concussion' Compact Medium Graviton Smartbomb",
    ]);
    expect(smartbombs.slice(12, 14)).toEqual(["Large EMP Smartbomb I", "Large EMP Smartbomb II"]);
  });

  test("charge search, by root market group", () => {
    const roots = sde.chargeSearch();
    expect(roots.map((node) => node.group.name)).toEqual(["Ammunition & Charges", "Special Edition Assets"]);

    const ammunition = roots[0]!;
    expect(ammunition.types.every((type) => type.categoryId === 8)).toBe(true);
    const emp = ammunition.types.filter((type) => type.name.startsWith("EMP ")).map((type) => type.name);
    expect(emp).toEqual(["EMP L", "EMP M", "EMP S", "EMP XL"]);
    expect(ammunition.folders[0]!.types.map((type) => type.name)).toContain("Republic Fleet EMP S");
  });

  test("charges, groups with groups in them first", () => {
    const roots = sde.chargeTree();
    expect(roots.map((node) => node.group.name)).toEqual([
      "Command Burst Charges",
      "Condenser Packs",
      "Exotic Plasma Charges",
      "Frequency Crystals",
      "Hybrid Charges",
      "Mining Crystals",
      "Missiles",
      "Probes",
      "Projectile Ammo",
      "Bombs",
      "Breacher Pods",
      "Cap Booster Charges",
      "Nanite Repair Paste",
      "Scripts",
      "Structure Area Denial Ammunition",
      "Structure Guided Bombs",
      "Special Edition Festival Assets",
    ]);

    const hybrid = roots.find((node) => node.group.name === "Hybrid Charges")!;
    expect(hybrid.children.map((node) => node.group.name)).not.toContain("Orbital Strike");

    const festival = roots.at(-1)!;
    expect(festival.types.length).toBeGreaterThan(0);
    expect(festival.types.every((type) => type.categoryId === 8)).toBe(true);
  });

  test("implants and boosters, groups with groups in them first", () => {
    const roots = sde.implantTree();
    expect(roots.map((node) => node.group.name)).toEqual(["Booster", "Implants", "Cerebral Accelerators"]);

    const attributes = roots[1]!.children.find((node) => node.group.name === "Attribute Enhancers")!;
    expect(attributes.children[0]!.group.name).toBe("Implant Slot 01");
    expect(
      roots.flatMap((node) => node.children).every((node) => node.types.every((type) => type.categoryId === 20)),
    ).toBe(true);
  });

  test("implant search, by root market group", () => {
    const roots = sde.implantSearch();
    expect(roots[0]!.group.name).toBe("Implants & Boosters");
    expect(roots[0]!.types.map((type) => type.name)).toContain("Standard Blue Pill Booster");
  });

  test("types sorted by meta, with faction ones in a folder", () => {
    const names = ["Republic Fleet EMP S", "Barrage S", "EMP S", "Carbonized Lead S"];
    const sorted = sde.sortByMeta(names.map((name) => sde.typeByName(name)!));
    expect(sorted.types.map((type) => type.name)).toEqual(["Carbonized Lead S", "EMP S", "Barrage S"]);
    expect(sorted.folders.map((node) => [node.folder, node.types.map((type) => type.name)])).toEqual([
      ["faction", ["Republic Fleet EMP S"]],
    ]);
  });

  test("ships by group and race", () => {
    const frigates = sde.shipTree().find((node) => node.group.name === "Frigate")!;
    expect(frigates.races.map((node) => node.race)).toEqual(["amarr", "caldari", "gallente", "minmatar", "other"]);

    expect(frigates.races.map((node) => node.factionId)).toEqual([500003, 500001, 500004, 500002, undefined]);

    const minmatar = frigates.races.find((node) => node.race === "minmatar")!;
    expect(minmatar.ships.map((ship) => ship.name)).toContain("Rifter");
    expect(minmatar.ships.every((ship) => ship.published && ship.categoryId === 6)).toBe(true);
  });

  test("structures with the hulls, sorted by meta", () => {
    const citadels = sde.shipTree().find((node) => node.group.name === "Citadel")!;
    expect(citadels.races.map((node) => node.race)).toEqual(["other"]);
    expect(citadels.races[0]!.ships.map((ship) => ship.name).slice(0, 4)).toEqual([
      "Astrahus",
      "Fortizar",
      "Keepstar",
      "'Draccous' Fortizar",
    ]);
  });
});
