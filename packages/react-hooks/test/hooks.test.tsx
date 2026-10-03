// @vitest-environment jsdom
import { Esi } from "@eveshipfit/esi";
import { Engine, type FitStore } from "@eveshipfit/fitting";
import type { Images } from "@eveshipfit/images";
import type { MarketGroupNode, ModuleGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, expect, test, vi } from "vitest";

import {
  EveShipFitProvider,
  ImagesProvider,
  LocalFits,
  TextsProvider,
  useAttribute,
  useAttributeTooltip,
  useBayContents,
  useBayUsage,
  useCanFit,
  useCharacters,
  useChargedModules,
  useChargeSearch,
  useChargeTree,
  useCharges,
  useDrag,
  useDroneRoom,
  useEngine,
  useFit,
  useFitHistory,
  useFitPrice,
  useFitStore,
  useFighterTubes,
  useFighterTubeUsage,
  useHardpoints,
  useHullTree,
  useImages,
  useLocalFits,
  useMarketTree,
  useMissingSkills,
  useModuleSearch,
  useModuleTree,
  usePlacement,
  usePreview,
  useRackUsage,
  useSde,
  useSlots,
  useSnapshot,
  useStats,
  useType,
  useViolations,
  type EveShipFitProviderProps,
  type FitStorage,
} from "../src/index.js";
import { testEngine, testTexts } from "./files.js";

const RIFTER = 587;
const DAMAGE_CONTROL_II = 2048;

let engine: Engine;
beforeAll(async () => {
  engine = await testEngine();
});

function render<T>(hook: () => T, props: Omit<EveShipFitProviderProps, "engine"> = {}) {
  return renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <EveShipFitProvider engine={engine} {...props}>
        {children}
      </EveShipFitProvider>
    ),
  });
}

function withDamageControl(): FitStore {
  return engine.createFit({
    ship: { type_id: RIFTER },
    items: [{ type_id: DAMAGE_CONTROL_II, slot: { type: "low", index: 2 }, state: "active" }],
  });
}

test("hooks throw outside the provider", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => renderHook(() => useFit())).toThrow("This hook needs to be inside an <EveShipFitProvider>");
});

test("without a fit, the provider starts an empty Rifter", () => {
  const { result } = render(() => ({ engine: useEngine(), sde: useSde(), fit: useFit() }));

  expect(result.current.engine).toBe(engine);
  expect(result.current.sde).toBe(engine.sde);
  expect(result.current.fit.ship.type_id).toBe(RIFTER);
  expect(result.current.fit.items).toEqual([]);
});

test("a change to the fit re-renders", () => {
  const { result } = render(() => ({ store: useFitStore(), fit: useFit() }));

  act(() => void result.current.store.fit(DAMAGE_CONTROL_II));
  expect(result.current.fit.items.map((item) => item.type_id)).toEqual([DAMAGE_CONTROL_II]);
});

test("the stats are the preview's until it is cleared", () => {
  const { result } = render(() => ({ preview: usePreview(), stats: useStats(), snapshot: useSnapshot() }));

  act(() => result.current.preview.show((draft) => void draft.fit(DAMAGE_CONTROL_II)));
  expect(result.current.stats).toBe(result.current.preview.preview?.after.stats);

  act(() => result.current.preview.clear());
  expect(result.current.preview.preview).toBeUndefined();
  expect(result.current.stats).toBe(result.current.snapshot.stats);
});

test("a drop target only clears the preview it showed", () => {
  const { result } = render(() => usePreview());

  act(() => result.current.show((draft) => void draft.fit(DAMAGE_CONTROL_II), "slot"));
  act(() => result.current.show((draft) => void draft.fit(DAMAGE_CONTROL_II), "bay"));
  act(() => result.current.clear("slot"));
  expect(result.current.preview).toBeDefined();

  act(() => result.current.clear("bay"));
  expect(result.current.preview).toBeUndefined();
});

test("a preview is dropped when the fit changes", () => {
  const { result } = render(() => ({ store: useFitStore(), preview: usePreview(), stats: useStats() }));

  act(() => result.current.preview.show((draft) => void draft.fit(DAMAGE_CONTROL_II)));
  act(() => result.current.store.setName("Changed"));

  expect(result.current.preview.preview).toBeUndefined();
  expect(result.current.stats).toBe(result.current.store.getSnapshot().stats);
});

test("attributes are formatted the way EVE shows them", () => {
  const { result } = render(() => ({
    resonance: useAttribute("shieldEmDamageResonance"),
    custom: useAttribute("cpuOutput", { format: (value) => `${value} CPU` }),
    unknown: useAttribute("noSuchAttribute"),
    missing: useAttribute("damagePerSecondWithoutReload", { fallback: 0, decimals: 1, fixed: true }),
  }));

  expect(result.current.resonance).toEqual({ value: 1, text: "0 %", change: undefined });
  expect(result.current.custom.text).toMatch(/^[\d.]+ CPU$/);
  expect(result.current.unknown).toEqual({ value: undefined, text: "–", change: undefined });
  expect(result.current.missing).toEqual({ value: 0, text: "0.0 DPS", change: undefined });
});

test("attributes say whether a preview makes them better or worse", () => {
  const { result } = render(() => ({ preview: usePreview(), resonance: useAttribute("shieldEmDamageResonance") }), {
    fit: withDamageControl(),
  });

  act(() => result.current.preview.show((draft) => draft.remove(0)));
  expect(result.current.resonance).toEqual({ value: 1, text: "0 %", change: "worse" });

  act(() => result.current.preview.show((draft) => draft.setName("Changed")));
  expect(result.current.resonance.change).toBeUndefined();
});

test("attributes of an item", () => {
  const { result } = render(() => ({ item: useAttribute("cpu", { of: 0 }), ship: useAttribute("cpu") }), {
    fit: withDamageControl(),
  });
  expect(result.current.item.text).toMatch(/^[\d.]+ tf$/);
  expect(result.current.ship.value).toBeUndefined();
});

test("undo and redo", () => {
  const { result } = render(() => ({ store: useFitStore(), history: useFitHistory(), fit: useFit() }));
  expect(result.current.history.canUndo).toBe(false);

  act(() => void result.current.store.fit(DAMAGE_CONTROL_II));
  expect(result.current.history.canUndo).toBe(true);

  act(() => result.current.history.undo());
  expect(result.current.fit.items).toEqual([]);
  expect(result.current.history.canRedo).toBe(true);

  act(() => result.current.history.redo());
  expect(result.current.fit.items).toHaveLength(1);
});

test("going back in the history", () => {
  const { result } = render(() => ({ store: useFitStore(), history: useFitHistory(), fit: useFit() }));
  act(() => void result.current.store.fit(DAMAGE_CONTROL_II));
  act(() => void result.current.store.fit(DAMAGE_CONTROL_II));
  expect(result.current.history).toMatchObject({ length: 3, position: 2 });

  act(() => result.current.history.goTo(0));
  expect(result.current.fit.items).toEqual([]);
  expect(result.current.history).toMatchObject({ length: 3, position: 0 });
});

test("violations and bays", () => {
  const fit = withDamageControl();
  fit.setCharacter({ skills: {} });
  const { result } = render(() => ({ violations: useViolations(), cargo: useBayUsage("cargo") }), { fit });

  expect(result.current.violations).toContainEqual(
    expect.objectContaining({ rule: expect.objectContaining({ type: "skill" }) }),
  );
  expect(result.current.cargo).toEqual({ used: 0, total: 140 });
});

test("bay contents are one entry per type, by name", () => {
  const byName = (name: string) => engine.sde.typeByName(name)!.id;
  const fit = engine.createFit({
    ship: { type_id: byName("Tristan") },
    items: [
      { type_id: byName("Nanite Repair Paste"), slot: { type: "cargo" }, quantity: 30, state: "offline" },
      { type_id: byName("Warrior II"), slot: { type: "drone_bay" }, quantity: 2, state: "active" },
      { type_id: byName("EMP S"), slot: { type: "cargo" }, quantity: 100, state: "offline" },
      { type_id: byName("Warrior II"), slot: { type: "drone_bay" }, quantity: 3, state: "offline" },
    ],
  });
  const { result } = render(() => ({ cargo: useBayContents("cargo"), drones: useBayContents("droneBay") }), { fit });

  expect(result.current.cargo.map(({ type, quantity, refs }) => [type.name, quantity, refs])).toEqual([
    ["EMP S", 100, [2]],
    ["Nanite Repair Paste", 30, [0]],
  ]);
  expect(result.current.drones.map(({ type, quantity, active, refs }) => [type.name, quantity, active, refs])).toEqual([
    ["Warrior II", 5, 2, [1, 3]],
  ]);
});

test("drone room is what the active limit and bandwidth leave, without the preview", () => {
  const byName = (name: string) => engine.sde.typeByName(name)!;
  const fit = engine.createFit({
    ship: { type_id: byName("Tristan").id },
    items: [{ type_id: byName("Hobgoblin II").id, slot: { type: "drone_bay" }, quantity: 3, state: "active" }],
  });
  const { result } = render(
    () => ({
      preview: usePreview(),
      hobgoblin: useDroneRoom(byName("Hobgoblin II")),
      hammerhead: useDroneRoom(byName("Hammerhead II")),
    }),
    { fit },
  );
  expect(result.current).toMatchObject({ hobgoblin: 2, hammerhead: 1 });

  act(() => result.current.preview.show((draft) => void draft.fit(byName("Hobgoblin II").id)));
  expect(result.current).toMatchObject({ hobgoblin: 2, hammerhead: 1 });
});

test("slots list every slot of a rack, empty ones included", () => {
  const { result } = render(
    () => ({ lows: useSlots("low"), usage: useRackUsage("low"), hardpoints: useHardpoints() }),
    {
      fit: withDamageControl(),
    },
  );

  expect(result.current.lows.map((slot) => slot.item?.type_id)).toEqual([
    undefined,
    undefined,
    DAMAGE_CONTROL_II,
    undefined,
  ]);
  expect(result.current.lows[2]).toMatchObject({ index: 2, ref: 0, stats: expect.any(Object) });
  expect(result.current.usage).toEqual({ used: 1, total: 4 });
  expect(result.current.hardpoints).toEqual({ turret: { used: 0, total: 3 }, launcher: { used: 0, total: 2 } });
});

test("slots follow the preview, and tell what only the preview fills", () => {
  const { result } = render(
    () => ({ preview: usePreview(), lows: useSlots("low"), usage: useRackUsage("low"), hardpoints: useHardpoints() }),
    { fit: withDamageControl() },
  );

  act(() => result.current.preview.show((draft) => void draft.fit(DAMAGE_CONTROL_II)));
  expect(result.current.lows.map((slot) => slot.item?.type_id)).toEqual([
    DAMAGE_CONTROL_II,
    undefined,
    DAMAGE_CONTROL_II,
    undefined,
  ]);
  expect(result.current.lows[0]).toMatchObject({ ref: undefined, preview: true });
  expect(result.current.lows[2]).toMatchObject({ ref: 0, preview: false });
  expect(result.current.usage).toEqual({ used: 2, total: 4 });

  act(() => result.current.preview.show((draft) => void draft.fit(engine.sde.typeByName("200mm AutoCannon II")!.id)));
  expect(result.current.hardpoints.turret).toEqual({ used: 1, total: 3 });

  act(() => result.current.preview.clear());
  expect(result.current.lows.map((slot) => slot.preview)).toEqual([false, false, false, false]);
  expect(result.current.usage).toEqual({ used: 1, total: 4 });
});

test("slots the ship does not have come after the real ones", () => {
  const fit = engine.createFit({
    ship: { type_id: RIFTER },
    items: [{ type_id: DAMAGE_CONTROL_II, slot: { type: "low", index: 5 }, state: "active" }],
  });
  const { result } = render(() => useSlots("low"), { fit });

  expect(result.current).toHaveLength(6);
  expect(result.current[5]?.item?.type_id).toBe(DAMAGE_CONTROL_II);
});

test("fighter tubes follow the preview, and the fighter bay lists what is not launched", () => {
  const byName = (name: string) => engine.sde.typeByName(name)!.id;
  const fit = engine.createFit({
    ship: { type_id: byName("Thanatos") },
    items: [
      { type_id: byName("Templar II"), slot: { type: "fighter_tube", index: 1 }, quantity: 6, state: "active" },
      { type_id: byName("Templar II"), slot: { type: "fighter_bay" }, quantity: 3, state: "offline" },
    ],
  });
  const { result } = render(
    () => ({
      preview: usePreview(),
      tubes: useFighterTubes(),
      usage: useFighterTubeUsage(),
      bay: useBayContents("fighterBay"),
    }),
    { fit },
  );

  expect(result.current.tubes.map((tube) => tube.ref)).toEqual([undefined, 0, undefined, undefined]);
  expect(result.current.bay.map(({ type, quantity, refs }) => [type.name, quantity, refs])).toEqual([
    ["Templar II", 3, [1]],
  ]);

  act(() => result.current.preview.show((draft) => void draft.fit(byName("Dromi II"))));
  expect(result.current.tubes[0]).toMatchObject({ ref: undefined, preview: true, item: { quantity: 3 } });
  expect(result.current.usage).toMatchObject({ all: { used: 2, total: 4 }, support: { used: 1, total: 2 } });
});

test("a character without skills flies the fit worse", () => {
  const { result } = render(() => ({ characters: useCharacters(), cpu: useAttribute("cpuOutput") }));
  expect(result.current.characters.characters.map((character) => character.name)).toEqual(["All L5", "All L0"]);
  const withSkills = result.current.cpu.value!;

  act(() => result.current.characters.select("no-skills"));
  expect(result.current.characters.current).toBe("no-skills");
  expect(result.current.cpu.value).toBeLessThan(withSkills);
});

test("missing skills follow the character", () => {
  const { result } = render(() => ({ characters: useCharacters(), missingSkills: useMissingSkills() }));
  expect(result.current.missingSkills([RIFTER])).toEqual([]);

  act(() => result.current.characters.select("no-skills"));
  expect(result.current.missingSkills([RIFTER])).toContainEqual(
    expect.objectContaining({ type_id: engine.sde.typeByName("Minmatar Frigate")!.id, required: 1, level: 0 }),
  );

  const fitted = withDamageControl().getSnapshot().fit;
  expect(result.current.missingSkills(fitted).length).toBeGreaterThan(result.current.missingSkills([RIFTER]).length);
});

test("drag and drop", () => {
  const { result } = render(() => useDrag());

  act(() => result.current.start({ type: "type", typeId: DAMAGE_CONTROL_II }));
  expect(result.current.dragging).toEqual({ type: "type", typeId: DAMAGE_CONTROL_II });

  act(() => result.current.end());
  expect(result.current.dragging).toBeUndefined();
});

test("saved fits", () => {
  const items = new Map<string, string>();
  const storage: FitStorage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
  const { result } = render(() => ({ localFits: useLocalFits(), fit: useFit() }), {
    localFits: new LocalFits(storage),
  });

  act(() => result.current.localFits.save(result.current.fit));
  expect(result.current.localFits.fits).toEqual([result.current.fit]);

  act(() => result.current.localFits.remove(result.current.fit));
  expect(result.current.localFits.fits).toEqual([]);
});

test("images need no engine, only their own provider", () => {
  const images = {} as Images;
  const { result } = renderHook(() => useImages(), {
    wrapper: ({ children }: { children: ReactNode }) => <ImagesProvider images={images}>{children}</ImagesProvider>,
  });
  expect(result.current).toBe(images);

  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(() => useImages())).toThrow("This hook needs to be inside an <ImagesProvider>");
});

test("attribute tooltips need both the engine and their own provider", async () => {
  const texts = await testTexts();
  const { result } = renderHook(
    () => ({ sensor: useAttributeTooltip("scanLadarStrength"), none: useAttributeTooltip("armorEmDamageResonance") }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <EveShipFitProvider engine={engine}>
          <TextsProvider texts={texts}>{children}</TextsProvider>
        </EveShipFitProvider>
      ),
    },
  );
  expect(result.current.sensor?.title).toBe("Ladar Sensor Strength");
  expect(result.current.none).toBeUndefined();

  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(() => useAttributeTooltip("scanLadarStrength"))).toThrow(
    "This hook needs to be inside an <TextsProvider>",
  );
});

test("types", () => {
  const { result } = render(() => ({ rifter: useType(RIFTER), none: useType(undefined) }));
  expect(result.current.rifter?.name).toBe("Rifter");
  expect(result.current.none).toBeUndefined();
});

test("the charges a module can load", () => {
  const autocannon = engine.sde.typeByName("200mm AutoCannon II")!.id;
  const { result, rerender } = render(() => ({
    autocannon: useCharges(autocannon),
    damageControl: useCharges(DAMAGE_CONTROL_II),
    none: useCharges(undefined),
  }));
  const first = result.current.autocannon;

  expect(first.map((type) => type.name)).toContain("EMP S");
  expect(first.map((type) => type.name)).not.toContain("EMP M");
  expect(result.current.damageControl).toEqual([]);
  expect(result.current.none).toEqual([]);

  rerender();
  expect(result.current.autocannon).toBe(first);
});

const onlyDamageControl = (type: SdeType) => type.id === DAMAGE_CONTROL_II;
const onlyRifter = (type: SdeType) => type.id === RIFTER;

test("the market keeps only the groups leading to what the filter keeps", () => {
  const { result } = render(() => useMarketTree(onlyDamageControl));
  const groups = allGroups(result.current);

  expect(groups.flatMap((node) => node.types.map((type) => type.id))).toEqual([DAMAGE_CONTROL_II]);
  expect(groups.filter((node) => node.types.length === 0 && node.children.length === 0)).toEqual([]);
});

function allGroups(nodes: readonly MarketGroupNode[]): MarketGroupNode[] {
  return nodes.flatMap((node) => [node, ...allGroups(node.children)]);
}

test("the hulls keep only the groups and races of what the filter keeps", () => {
  const { result } = render(() => useHullTree(onlyRifter));

  expect(result.current).toHaveLength(1);
  expect(result.current[0]?.group.name).toBe("Frigate");
  expect(result.current[0]?.races).toEqual([{ race: "minmatar", factionId: 500002, ships: [engine.sde.type(RIFTER)] }]);
});

const onlyRepublicFleet = (type: SdeType) => type.name.startsWith("Republic Fleet Large Shield Extender");

test("the modules keep only the groups and folders of what the filter keeps", () => {
  const { result } = render(() => useModuleTree(onlyRepublicFleet));
  const groups = allModuleGroups(result.current);

  expect(groups.flatMap((node) => node.types)).toEqual([]);
  expect(groups.flatMap((node) => node.folders.map((folder) => folder.folder))).toEqual(["faction"]);
  expect(groups.filter((node) => node.children.length === 0 && node.folders.length === 0)).toEqual([]);
});

test("the search keeps only the roots and folders of what the filter keeps", () => {
  const { result } = render(() => ({
    modules: useModuleSearch(onlyRepublicFleet),
    charges: useChargeSearch((type) => type.name === "Republic Fleet EMP S"),
  }));

  expect(result.current.modules.map((node) => node.group.name)).toEqual(["Ship Equipment"]);
  expect(result.current.modules[0]?.types).toEqual([]);
  expect(result.current.modules[0]?.folders.map((folder) => folder.folder)).toEqual(["faction"]);
  expect(result.current.charges.map((node) => node.group.name)).toEqual(["Ammunition & Charges"]);
});

function allModuleGroups(nodes: readonly ModuleGroupNode[]): ModuleGroupNode[] {
  return nodes.flatMap((node) => [node, ...allModuleGroups(node.children)]);
}

const byName = (name: string) => engine.sde.typeByName(name)!;

test("where a type goes, and whether it may go on the fit's ship", () => {
  const { result } = render(() => ({ placement: usePlacement(), canFit: useCanFit() }));

  expect(result.current.placement(byName("Damage Control II"))).toEqual({ type: "low" });
  expect(result.current.canFit(byName("Damage Control II"))).toBe(true);
  expect(result.current.canFit(byName("Medium Projectile Burst Aerator I"))).toBe(false);
  expect(result.current.canFit(byName("Loki Core - Augmented Nuclear Reactor"))).toBe(false);
  expect(result.current.canFit(byName("Warrior II"))).toBe(false);
  expect(result.current.canFit(byName("Templar II"))).toBe(false);
  expect(result.current.canFit(byName("EMP S"))).toBe(true);
});

test("a carrier takes fighters of the kinds it has tubes for", () => {
  const { result } = render(() => useCanFit(), {
    fit: engine.createFit({ ship: { type_id: byName("Archon").id }, items: [] }),
  });
  expect(result.current(byName("Templar II"))).toBe(true);
  expect(result.current(byName("Cyclops II"))).toBe(false);
});

test("a tech III cruiser takes its own subsystems", () => {
  const { result } = render(() => useCanFit(), {
    fit: engine.createFit({ ship: { type_id: byName("Loki").id }, items: [] }),
  });
  expect(result.current(byName("Loki Core - Augmented Nuclear Reactor"))).toBe(true);
  expect(result.current(byName("Tengu Core - Augmented Graviton Reactor"))).toBe(false);
});

test("the fit check stays the same while the fit changes in ways it does not read", () => {
  const { result } = render(() => ({ canFit: useCanFit(), store: useFitStore() }));
  const first = result.current.canFit;
  act(() => void result.current.store.fit(DAMAGE_CONTROL_II));
  expect(result.current.canFit).toBe(first);
});

test("a structure lists its modules and rigs", () => {
  const { result } = render(() => ({ canFit: useCanFit(), tree: useModuleTree() }), {
    fit: engine.createFit({ ship: { type_id: byName("Astrahus").id }, items: [] }),
  });
  const types = allModuleGroups(result.current.tree).flatMap((node) => node.types);
  const fits = (name: string) => types.some((type) => type.name === name && result.current.canFit(type));

  expect(fits("Standup Ballistic Control System I")).toBe(true);
  expect(fits("Standup M-Set Equipment Manufacturing Time Efficiency I")).toBe(true);
});

test("a ship with a drone bay takes drones", () => {
  const { result } = render(() => useCanFit(), {
    fit: engine.createFit({ ship: { type_id: engine.sde.typeByName("Tristan")!.id }, items: [] }),
  });
  expect(result.current(engine.sde.typeByName("Warrior II")!)).toBe(true);
});

test("the charges keep only the groups of what the filter keeps", () => {
  const { result } = render(() => useChargeTree(onlyEmpS));

  expect(result.current.map((node) => node.group.name)).toEqual(["Projectile Ammo"]);
  expect(allMarketTypes(result.current).map((type) => type.name)).toEqual(["EMP S"]);
});

const onlyEmpS = (type: SdeType) => type.name === "EMP S";

function allMarketTypes(nodes: readonly MarketGroupNode[]): SdeType[] {
  return nodes.flatMap((node) => [...allMarketTypes(node.children), ...node.types]);
}

test("the fitted modules that load charges, each once, in slot order", () => {
  const { result } = render(() => useChargedModules(), {
    fit: engine.createFit({
      ship: { type_id: RIFTER },
      items: [
        { type_id: byName("Light Missile Launcher II").id, slot: { type: "high", index: 2 }, state: "active" },
        { type_id: byName("200mm AutoCannon II").id, slot: { type: "high", index: 1 }, state: "active" },
        { type_id: byName("200mm AutoCannon II").id, slot: { type: "high", index: 0 }, state: "active" },
        { type_id: byName("Medium Capacitor Booster II").id, slot: { type: "medium", index: 0 }, state: "active" },
        { type_id: DAMAGE_CONTROL_II, slot: { type: "low", index: 0 }, state: "active" },
        { type_id: byName("EMP S").id, slot: { type: "cargo" }, quantity: 100, state: "offline" },
      ],
    }),
  });

  expect(result.current.map((type) => type.name)).toEqual([
    "200mm AutoCannon II",
    "Light Missile Launcher II",
    "Medium Capacitor Booster II",
  ]);
});

test("the fit price is the shown fit's, at the engine's ESI prices", async () => {
  const esi = new Esi({ userAgent: "test" });
  vi.spyOn(esi, "marketPrices").mockResolvedValue(
    new Map([
      [RIFTER, { type_id: RIFTER, average_price: 300_000 }],
      [DAMAGE_CONTROL_II, { type_id: DAMAGE_CONTROL_II, average_price: 500_000 }],
    ]),
  );
  const priced = new Engine(engine.sde, esi);
  const { result } = renderHook(() => ({ price: useFitPrice(), preview: usePreview() }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <EveShipFitProvider engine={priced}>{children}</EveShipFitProvider>
    ),
  });

  expect(result.current.price).toEqual({ value: undefined, change: undefined });
  await waitFor(() => expect(result.current.price).toEqual({ value: 300_000, change: undefined }));

  act(() => result.current.preview.show((draft) => void draft.fit(DAMAGE_CONTROL_II)));
  expect(result.current.price).toEqual({ value: 800_000, change: "worse" });
});

test("the fit price is gone with the engine's ESI", async () => {
  const esi = new Esi({ userAgent: "test" });
  vi.spyOn(esi, "marketPrices").mockResolvedValue(new Map([[RIFTER, { type_id: RIFTER, average_price: 300_000 }]]));
  let current = new Engine(engine.sde, esi);
  const { result, rerender } = renderHook(() => useFitPrice(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <EveShipFitProvider engine={current}>{children}</EveShipFitProvider>
    ),
  });
  await waitFor(() => expect(result.current.value).toBe(300_000));

  current = new Engine(engine.sde);
  rerender();
  expect(result.current.value).toBeUndefined();
});

test("the fit price falls back to ESI's adjusted price, then zKillboard's", async () => {
  const esi = new Esi({ userAgent: "test" });
  vi.spyOn(esi, "marketPrices").mockResolvedValue(
    new Map([
      [RIFTER, { type_id: RIFTER, adjusted_price: 300_000 }],
      [DAMAGE_CONTROL_II, { type_id: DAMAGE_CONTROL_II, adjusted_price: 0 }],
    ]),
  );
  const zkillboard = new ZKillboard();
  const zkillboardPrice = vi.spyOn(zkillboard, "price").mockResolvedValue(500_000);
  const priced = new Engine(engine.sde, esi);
  const { result } = renderHook(() => useFitPrice(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <EveShipFitProvider engine={priced} fit={withDamageControl()} zkillboard={zkillboard}>
        {children}
      </EveShipFitProvider>
    ),
  });

  await waitFor(() => expect(result.current.value).toBe(800_000));
  expect(zkillboardPrice.mock.calls).toEqual([[DAMAGE_CONTROL_II]]);
});

function renderPriced(zkillboard: ZKillboard, esiPrices: [number, number][], fit?: FitStore) {
  const esi = new Esi({ userAgent: "test" });
  vi.spyOn(esi, "marketPrices").mockResolvedValue(
    new Map(esiPrices.map(([type_id, average_price]) => [type_id, { type_id, average_price }])),
  );
  const priced = new Engine(engine.sde, esi);
  return renderHook(() => ({ price: useFitPrice(), preview: usePreview() }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <EveShipFitProvider engine={priced} fit={fit} zkillboard={zkillboard}>
        {children}
      </EveShipFitProvider>
    ),
  });
}

test("a zKillboard failure is asked once, and prices as nothing", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const zkillboard = new ZKillboard();
  const zkillboardPrice = vi.spyOn(zkillboard, "price").mockRejectedValue(new Error("down"));
  const { result } = renderPriced(zkillboard, [[RIFTER, 300_000]], withDamageControl());

  await waitFor(() => expect(result.current.price.value).toBe(300_000));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(zkillboardPrice).toHaveBeenCalledTimes(1);
});

test("a preview does not ask zKillboard", async () => {
  const zkillboard = new ZKillboard();
  const zkillboardPrice = vi.spyOn(zkillboard, "price").mockResolvedValue(500_000);
  const { result } = renderPriced(zkillboard, [[RIFTER, 300_000]]);
  await waitFor(() => expect(result.current.price.value).toBe(300_000));

  act(() => result.current.preview.show((draft) => void draft.fit(DAMAGE_CONTROL_II)));
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(result.current.price).toEqual({ value: 300_000, change: undefined });
  expect(zkillboardPrice).not.toHaveBeenCalled();
});

test("without ESI, the fit has no price", () => {
  const { result } = render(() => useFitPrice());

  expect(result.current.value).toBeUndefined();
});
