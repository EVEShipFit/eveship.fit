import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { Group } from "../ids.js";

/** The words in the names of a ship's modes, in the order EVE shows them. */
const modeWords: readonly (readonly string[])[] = [
  ["Defense", "Primary"],
  ["Sharpshooter", "Secondary"],
  ["Propulsion", "Tertiary"],
];

const modesByShip = new WeakMap<Sde, ReadonlyMap<number, readonly SdeType[]>>();
const noModes: readonly SdeType[] = [];

/** The modes of a ship, in the order EVE shows them, the one it starts in first; empty for a ship without modes. */
export function modesOf(sde: Sde, ship: SdeType): readonly SdeType[] {
  let byShip = modesByShip.get(sde);
  if (byShip === undefined) modesByShip.set(sde, (byShip = findModes(sde)));
  return byShip.get(ship.id) ?? noModes;
}

function findModes(sde: Sde): ReadonlyMap<number, readonly SdeType[]> {
  const found = new Map<number, { mode: SdeType; order: number }[]>();
  for (const mode of sde.types()) {
    if (mode.groupId !== Group.ShipModifier) continue;
    const [, shipName, word] = /^(.+) (\S+) Mode$/.exec(mode.name) ?? [];
    const ship = shipName === undefined ? undefined : sde.typeByName(shipName);
    if (ship === undefined || word === undefined) continue;

    const order = modeWords.findIndex((words) => words.includes(word));
    const modes = found.get(ship.id) ?? [];
    modes.push({ mode, order: order === -1 ? modeWords.length : order });
    found.set(ship.id, modes);
  }

  return new Map(
    [...found].map(([ship, modes]) => [ship, modes.toSorted((a, b) => a.order - b.order).map(({ mode }) => mode)]),
  );
}
