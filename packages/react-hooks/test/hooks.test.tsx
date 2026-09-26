// @vitest-environment jsdom
import type { Engine, FitStore } from "@eveshipfit/fitting";
import type { MarketGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, expect, test, vi } from "vitest";

import {
  EveShipFitProvider,
  LocalFits,
  useAttribute,
  useCharacters,
  useDrag,
  useEngine,
  useFit,
  useFitHistory,
  useFitStore,
  useHardpoints,
  useHullTree,
  useLocalFits,
  useMarketTree,
  usePreview,
  useRackUsage,
  useSde,
  useSlots,
  useSnapshot,
  useStats,
  useType,
  type EveShipFitProviderProps,
  type FitStorage,
} from "../src/index.js";
import { testEngine } from "./files.js";

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
  }));

  expect(result.current.resonance).toEqual({ value: 1, text: "0 %", change: undefined });
  expect(result.current.custom.text).toMatch(/^[\d.]+ CPU$/);
  expect(result.current.unknown).toEqual({ value: undefined, text: "–", change: undefined });
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

test("slots the ship does not have come after the real ones", () => {
  const fit = engine.createFit({
    ship: { type_id: RIFTER },
    items: [{ type_id: DAMAGE_CONTROL_II, slot: { type: "low", index: 5 }, state: "active" }],
  });
  const { result } = render(() => useSlots("low"), { fit });

  expect(result.current).toHaveLength(6);
  expect(result.current[5]?.item?.type_id).toBe(DAMAGE_CONTROL_II);
});

test("a character without skills flies the fit worse", () => {
  const { result } = render(() => ({ characters: useCharacters(), cpu: useAttribute("cpuOutput") }));
  expect(result.current.characters.characters.map((character) => character.name)).toEqual([
    "All Skills V",
    "No Skills",
  ]);
  const withSkills = result.current.cpu.value!;

  act(() => result.current.characters.select("no-skills"));
  expect(result.current.characters.current).toBe("no-skills");
  expect(result.current.cpu.value).toBeLessThan(withSkills);
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

test("types", () => {
  const { result } = render(() => ({ rifter: useType(RIFTER), none: useType(undefined) }));
  expect(result.current.rifter?.name).toBe("Rifter");
  expect(result.current.none).toBeUndefined();
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
  expect(result.current[0]?.races).toEqual([{ race: "minmatar", ships: [engine.sde.type(RIFTER)] }]);
});
