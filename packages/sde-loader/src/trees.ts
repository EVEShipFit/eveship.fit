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

export interface MetaSortedTypes {
  readonly types: readonly SdeType[];
  readonly folders: readonly ModuleFolderNode[];
}

export interface ModuleGroupNode extends MetaSortedTypes {
  readonly group: SdeMarketGroup;
  readonly children: readonly ModuleGroupNode[];
}

export type ShipRace = "amarr" | "caldari" | "gallente" | "minmatar" | "other";

export interface ShipRaceNode {
  readonly race: ShipRace;
  /** The empire of the race; `undefined` for `other`. */
  readonly factionId: number | undefined;
  readonly ships: readonly SdeType[];
}

export interface ShipGroupNode {
  readonly group: SdeGroup;
  readonly races: readonly ShipRaceNode[];
}

/** Ship and structure. */
export const HULL_CATEGORY_IDS: ReadonlySet<number> = new Set([6, 65]);
const CHARGE_CATEGORY_ID = 8;
const IMPLANT_CATEGORY_ID = 20;
/** Module, drone, subsystem, structure module and fighter. */
const FITTABLE_CATEGORY_IDS: ReadonlySet<number> = new Set([7, 18, 32, 66, 87]);

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
const STRUCTURE_EQUIPMENT_MARKET_GROUP_ID = 2202;
const STRUCTURE_MODIFICATIONS_MARKET_GROUP_ID = 2203;
const CHARGES_MARKET_GROUP_ID = 11;
const IMPLANTS_AND_BOOSTERS_MARKET_GROUP_ID = 24;
const FESTIVAL_MARKET_GROUP_ID = 1663;

/** Structure meta groups sort and go in folders as their ship counterparts do. */
const shipMetaGroups: Partial<Record<number, number>> = { 52: 4, 53: 2, 54: 1 };
const metaFolders: Partial<Record<number, MetaFolder>> = { 3: "faction", 4: "faction", 5: "officer", 6: "deadspace" };
const folderOrder: readonly MetaFolder[] = ["faction", "officer", "deadspace"];

function metaGroup(type: SdeType): number {
  return shipMetaGroups[type.metaGroupId ?? 0] ?? type.metaGroupId ?? 0;
}

const raceFactions = new Map(Object.entries(empireFactions).map(([id, race]) => [race, Number(id)]));

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

export type MetaLevel = (type: SdeType) => number;

export function sortByMeta(types: Iterable<SdeType>, metaLevel: MetaLevel): MetaSortedTypes {
  return sortInFolders(types, byMetaOf(metaLevel));
}

function sortInFolders(types: Iterable<SdeType>, compare: (a: SdeType, b: SdeType) => number): MetaSortedTypes {
  const byFolder = Map.groupBy(types, (type) => metaFolders[metaGroup(type)]);
  return {
    types: (byFolder.get(undefined) ?? []).toSorted(compare),
    folders: folderOrder.flatMap((folder) => {
      const folderTypes = byFolder.get(folder);
      return folderTypes === undefined ? [] : [{ folder, types: folderTypes.toSorted(compare) }];
    }),
  };
}

export function buildModuleTree(market: readonly MarketGroupNode[], metaLevel: MetaLevel): readonly ModuleGroupNode[] {
  const byId = indexMarket(market);

  const build = (node: MarketGroupNode): ModuleGroupNode[] => {
    const children = node.children.flatMap(build);
    const { types, folders } = sortByMeta(node.types, metaLevel);
    if (children.length === 0 && types.length === 0 && folders.length === 0) return [];
    return [{ group: node.group, children, types, folders }];
  };

  const roots = [
    ...(byId.get(SHIP_EQUIPMENT_MARKET_GROUP_ID)?.children ?? []),
    ...[
      DRONES_MARKET_GROUP_ID,
      RIGS_MARKET_GROUP_ID,
      SUBSYSTEMS_MARKET_GROUP_ID,
      STRUCTURE_EQUIPMENT_MARKET_GROUP_ID,
      STRUCTURE_MODIFICATIONS_MARKET_GROUP_ID,
    ].flatMap((id) => byId.get(id) ?? []),
  ];
  return roots.flatMap(build).toSorted((a, b) => byName(a.group, b.group));
}

export function buildModuleSearch(market: readonly MarketGroupNode[]): readonly ModuleGroupNode[] {
  return buildSearch(market, FITTABLE_CATEGORY_IDS);
}

export function buildChargeSearch(market: readonly MarketGroupNode[]): readonly ModuleGroupNode[] {
  return buildSearch(market, new Set([CHARGE_CATEGORY_ID]));
}

function buildSearch(market: readonly MarketGroupNode[], categoryIds: ReadonlySet<number>): readonly ModuleGroupNode[] {
  const within = (node: MarketGroupNode): SdeType[] => [
    ...node.types.filter((type) => categoryIds.has(type.categoryId)),
    ...node.children.flatMap(within),
  ];

  return market.flatMap((root) => {
    const types = within(root);
    return types.length === 0 ? [] : [{ group: root.group, children: [], ...sortInFolders(types, byName) }];
  });
}

export function buildChargeTree(market: readonly MarketGroupNode[], metaLevel: MetaLevel): readonly MarketGroupNode[] {
  const byId = indexMarket(market);
  const build = categoryTree(CHARGE_CATEGORY_ID, metaLevel);

  const charges = byId.get(CHARGES_MARKET_GROUP_ID)?.children.flatMap(build).toSorted(groupsFirst) ?? [];
  const festival = byId.get(FESTIVAL_MARKET_GROUP_ID);
  return [...charges, ...(festival === undefined ? [] : build(festival))];
}

export function buildImplantSearch(market: readonly MarketGroupNode[]): readonly ModuleGroupNode[] {
  return buildSearch(market, new Set([IMPLANT_CATEGORY_ID]));
}

export function buildImplantTree(market: readonly MarketGroupNode[], metaLevel: MetaLevel): readonly MarketGroupNode[] {
  const byId = indexMarket(market);
  const build = categoryTree(IMPLANT_CATEGORY_ID, metaLevel);
  return byId.get(IMPLANTS_AND_BOOSTERS_MARKET_GROUP_ID)?.children.flatMap(build).toSorted(groupsFirst) ?? [];
}

/** A market group cut down to the types of one category; empty for a group left without any. */
function categoryTree(categoryId: number, metaLevel: MetaLevel): (node: MarketGroupNode) => MarketGroupNode[] {
  const byMeta = byMetaOf(metaLevel);
  const build = (node: MarketGroupNode): MarketGroupNode[] => {
    const children = node.children.flatMap(build).toSorted(groupsFirst);
    const types = node.types.filter((type) => type.categoryId === categoryId).toSorted(byMeta);
    if (children.length === 0 && types.length === 0) return [];
    return [{ group: node.group, children, types }];
  };
  return build;
}

function groupsFirst(a: MarketGroupNode, b: MarketGroupNode): number {
  return Number(a.children.length === 0) - Number(b.children.length === 0) || byName(a.group, b.group);
}

function byMetaOf(metaLevel: MetaLevel): (a: SdeType, b: SdeType) => number {
  return (a, b) => metaGroup(a) - metaGroup(b) || metaLevel(a) - metaLevel(b) || byName(a, b);
}

function indexMarket(market: readonly MarketGroupNode[]): Map<number, MarketGroupNode> {
  const byId = new Map<number, MarketGroupNode>();
  const index = (nodes: readonly MarketGroupNode[]) => {
    for (const node of nodes) {
      byId.set(node.group.id, node);
      index(node.children);
    }
  };
  index(market);
  return byId;
}

export function buildShipTree(
  types: Iterable<SdeType>,
  group: (id: number) => SdeGroup | undefined,
  metaLevel: MetaLevel,
): readonly ShipGroupNode[] {
  const byMeta = byMetaOf(metaLevel);
  const shipsByGroup = new Map<number, SdeType[]>();
  for (const type of types) {
    if (!HULL_CATEGORY_IDS.has(type.categoryId) || !type.published || type.marketGroupId === undefined) continue;
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
        if (raceShips === undefined) return [];
        return [{ race, factionId: raceFactions.get(race), ships: raceShips.toSorted(byMeta) }];
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
