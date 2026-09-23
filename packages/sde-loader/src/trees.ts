import type { SdeGroup, SdeMarketGroup, SdeType } from "./records.js";

export interface MarketGroupNode {
  readonly group: SdeMarketGroup;
  readonly children: readonly MarketGroupNode[];
  readonly types: readonly SdeType[];
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
