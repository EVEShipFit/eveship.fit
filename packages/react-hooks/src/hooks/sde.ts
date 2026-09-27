import { chargesFor, type Engine, type Rack } from "@eveshipfit/fitting";
import type { MarketGroupNode, ModuleGroupNode, Sde, SdeType, ShipGroupNode } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { EngineContext, useRequiredContext } from "../context.js";
import { useFit } from "./fit.js";

export function useEngine(): Engine {
  return useRequiredContext(EngineContext);
}

export function useSde(): Sde {
  return useEngine().sde;
}

export function useType(typeId: number | undefined): SdeType | undefined {
  const sde = useSde();
  return typeId === undefined ? undefined : sde.type(typeId);
}

const chargeLists = new WeakMap<Sde, Map<number, readonly SdeType[]>>();
const noCharges: readonly SdeType[] = [];

/** Every published charge the module can load, sorted by name; empty for anything that takes none. */
export function useCharges(typeId: number | undefined): readonly SdeType[] {
  const sde = useSde();
  const module = useType(typeId);
  return module === undefined ? noCharges : chargesOf(sde, module);
}

const racks: readonly Rack[] = ["high", "medium", "low"];

/** The fitted modules that load charges, each type once, in slot order. */
export function useChargedModules(): readonly SdeType[] {
  const sde = useSde();
  const fit = useFit();
  return useMemo(() => {
    const slotted = fit.items.flatMap(({ type_id, slot }) => {
      const rack = racks.findIndex((each) => each === slot.type);
      return rack === -1 || !("index" in slot) ? [] : [{ typeId: type_id, rack, index: slot.index }];
    });
    const modules = new Map<number, SdeType>();
    for (const { typeId } of slotted.toSorted((a, b) => a.rack - b.rack || a.index - b.index)) {
      const module = sde.type(typeId);
      if (module !== undefined && chargesOf(sde, module).length > 0) modules.set(module.id, module);
    }
    return [...modules.values()];
  }, [sde, fit]);
}

function chargesOf(sde: Sde, module: SdeType): readonly SdeType[] {
  let lists = chargeLists.get(sde);
  if (lists === undefined) chargeLists.set(sde, (lists = new Map()));

  let charges = lists.get(module.id);
  if (charges === undefined) lists.set(module.id, (charges = chargesFor(sde, module)));
  return charges;
}

/**
 * The market, cut down to the types `filter` keeps; groups left empty are
 * dropped. Keep `filter` stable between renders, as the tree is rebuilt when
 * it changes.
 */
export function useMarketTree(filter?: (type: SdeType) => boolean): readonly MarketGroupNode[] {
  const sde = useSde();
  return useMemo(() => {
    const tree = sde.marketTree();
    return filter === undefined ? tree : pruneMarket(tree, filter);
  }, [sde, filter]);
}

/** What goes on a ship, cut down to the types a stable `filter` keeps. */
export function useModuleTree(filter?: (type: SdeType) => boolean): readonly ModuleGroupNode[] {
  const sde = useSde();
  return useMemo(() => {
    const tree = sde.moduleTree();
    return filter === undefined ? tree : pruneModules(tree, filter);
  }, [sde, filter]);
}

/** The charges by market group, cut down to the types a stable `filter` keeps. */
export function useChargeTree(filter?: (type: SdeType) => boolean): readonly MarketGroupNode[] {
  const sde = useSde();
  return useMemo(() => {
    const tree = sde.chargeTree();
    return filter === undefined ? tree : pruneMarket(tree, filter);
  }, [sde, filter]);
}

/**
 * The ships by group and race, cut down to those `filter` keeps; groups left
 * empty are dropped. Keep `filter` stable between renders, as the tree is
 * rebuilt when it changes.
 */
export function useHullTree(filter?: (ship: SdeType) => boolean): readonly ShipGroupNode[] {
  const sde = useSde();
  return useMemo(() => {
    const tree = sde.shipTree();
    if (filter === undefined) return tree;

    return tree
      .map((node) => ({
        group: node.group,
        races: node.races
          .map((race) => ({ ...race, ships: race.ships.filter(filter) }))
          .filter((race) => race.ships.length > 0),
      }))
      .filter((node) => node.races.length > 0);
  }, [sde, filter]);
}

function pruneMarket(nodes: readonly MarketGroupNode[], filter: (type: SdeType) => boolean): MarketGroupNode[] {
  const pruned: MarketGroupNode[] = [];
  for (const node of nodes) {
    const children = pruneMarket(node.children, filter);
    const types = node.types.filter(filter);
    if (children.length > 0 || types.length > 0) pruned.push({ group: node.group, children, types });
  }
  return pruned;
}

function pruneModules(nodes: readonly ModuleGroupNode[], filter: (type: SdeType) => boolean): ModuleGroupNode[] {
  const pruned: ModuleGroupNode[] = [];
  for (const node of nodes) {
    const children = pruneModules(node.children, filter);
    const types = node.types.filter(filter);
    const folders = node.folders
      .map((folder) => ({ folder: folder.folder, types: folder.types.filter(filter) }))
      .filter((folder) => folder.types.length > 0);
    if (children.length > 0 || types.length > 0 || folders.length > 0) {
      pruned.push({ group: node.group, children, types, folders });
    }
  }
  return pruned;
}
