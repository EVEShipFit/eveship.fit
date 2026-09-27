import type { SdeGroup, SdeMarketGroup, SdeType } from "./records.js";

export interface MarketGroupNode {
  readonly group: SdeMarketGroup;
  readonly children: readonly MarketGroupNode[];
  readonly types: readonly SdeType[];
}

/** A folder EVE shows after the other types of a market group. */
export type MetaFolder = "faction" | "officer" | "deadspace";

export interface ModuleFolderNode {
  readonly folder: MetaFolder;
  readonly types: readonly SdeType[];
}

export interface ModuleGroupNode {
  readonly group: SdeMarketGroup;
  readonly children: readonly ModuleGroupNode[];
  readonly types: readonly SdeType[];
  readonly folders: readonly ModuleFolderNode[];
}

export type ShipRace = "amarr" | "caldari" | "gallente" | "minmatar" | "other";

export interface ShipRaceNode {
  readonly race: ShipRace;
  readonly ships: readonly SdeType[];
}

export interface ShipGroupNode {
  readonly group: SdeGroup;
  readonly races: readonly ShipRaceNode[];
}

const SHIP_CATEGORY_ID = 6;

const empireFactions: Record<number, ShipRace> = {
  500001: "caldari",
  500002: "minmatar",
  500003: "amarr",
  500004: "gallente",
};

const SHIP_EQUIPMENT_MARKET_GROUP_ID = 9;
const DRONES_MARKET_GROUP_ID = 157;
const RIGS_MARKET_GROUP_ID = 1111;
const SUBSYSTEMS_MARKET_GROUP_ID = 1112;

const metaFolders: Partial<Record<number, MetaFolder>> = { 3: "faction", 4: "faction", 5: "officer", 6: "deadspace" };
const folderOrder: readonly MetaFolder[] = ["faction", "officer", "deadspace"];

const raceOrder: readonly ShipRace[] = ["amarr", "caldari", "gallente", "minmatar", "other"];

export function shipRace(ship: SdeType): ShipRace {
  return (ship.factionId !== undefined ? empireFactions[ship.factionId] : undefined) ?? "other";
}

export function buildMarketTree(
  marketGroups: Iterable<SdeMarketGroup>,
  types: Iterable<SdeType>,
): readonly MarketGroupNode[] {
  const children = new Map<number | undefined, SdeMarketGroup[]>();
  for (const group of marketGroups) {
    pushTo(children, group.parentGroupId, group);
  }

  const typesByGroup = new Map<number | undefined, SdeType[]>();
  for (const type of types) {
    if (!type.published || type.marketGroupId === undefined) continue;
    pushTo(typesByGroup, type.marketGroupId, type);
  }

  const build = (group: SdeMarketGroup): MarketGroupNode => ({
    group,
    children: (children.get(group.id) ?? []).toSorted(byName).map(build),
    types: (typesByGroup.get(group.id) ?? []).toSorted(byName),
  });
  return (children.get(undefined) ?? []).toSorted(byName).map(build);
}

export function buildModuleTree(
  market: readonly MarketGroupNode[],
  metaLevel: (type: SdeType) => number,
): readonly ModuleGroupNode[] {
  const byId = new Map<number, MarketGroupNode>();
  const index = (nodes: readonly MarketGroupNode[]) => {
    for (const node of nodes) {
      byId.set(node.group.id, node);
      index(node.children);
    }
  };
  index(market);

  const byMeta = (a: SdeType, b: SdeType) =>
    (a.metaGroupId ?? 0) - (b.metaGroupId ?? 0) || metaLevel(a) - metaLevel(b) || byName(a, b);

  const build = (node: MarketGroupNode): ModuleGroupNode[] => {
    const children = node.children.flatMap(build);
    const byFolder = Map.groupBy(node.types, (type) => metaFolders[type.metaGroupId ?? 0]);
    const types = (byFolder.get(undefined) ?? []).toSorted(byMeta);
    const folders = folderOrder.flatMap((folder) => {
      const folderTypes = byFolder.get(folder);
      return folderTypes === undefined ? [] : [{ folder, types: folderTypes.toSorted(byMeta) }];
    });
    if (children.length === 0 && types.length === 0 && folders.length === 0) return [];
    return [{ group: node.group, children, types, folders }];
  };

  const roots = [
    ...(byId.get(SHIP_EQUIPMENT_MARKET_GROUP_ID)?.children ?? []),
    ...[DRONES_MARKET_GROUP_ID, RIGS_MARKET_GROUP_ID, SUBSYSTEMS_MARKET_GROUP_ID].flatMap((id) => byId.get(id) ?? []),
  ];
  return roots.flatMap(build).toSorted((a, b) => byName(a.group, b.group));
}

export function buildShipTree(
  types: Iterable<SdeType>,
  group: (id: number) => SdeGroup | undefined,
): readonly ShipGroupNode[] {
  const shipsByGroup = new Map<number, SdeType[]>();
  for (const type of types) {
    if (type.categoryId !== SHIP_CATEGORY_ID || !type.published || type.marketGroupId === undefined) continue;
    pushTo(shipsByGroup, type.groupId, type);
  }

  const nodes: ShipGroupNode[] = [];
  for (const [groupId, ships] of shipsByGroup) {
    const shipGroup = group(groupId);
    if (shipGroup === undefined) continue;

    const byRace = Map.groupBy(ships, shipRace);
    nodes.push({
      group: shipGroup,
      races: raceOrder.flatMap((race) => {
        const raceShips = byRace.get(race);
        return raceShips === undefined ? [] : [{ race, ships: raceShips.toSorted(byName) }];
      }),
    });
  }
  return nodes.toSorted((a, b) => byName(a.group, b.group));
}

// A fixed locale, so the order does not depend on the machine it runs on.
const collator = new Intl.Collator("en");

function byName(a: { name: string }, b: { name: string }): number {
  return collator.compare(a.name, b.name);
}

function pushTo<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const list = map.get(key);
  if (list === undefined) map.set(key, [value]);
  else list.push(value);
}
