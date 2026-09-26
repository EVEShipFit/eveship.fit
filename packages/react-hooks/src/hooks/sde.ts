import type { Engine } from "@eveshipfit/fitting";
import type { MarketGroupNode, Sde, SdeType, ShipGroupNode } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { EngineContext, useRequiredContext } from "../context.js";

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
          .map((race) => ({ race: race.race, ships: race.ships.filter(filter) }))
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
