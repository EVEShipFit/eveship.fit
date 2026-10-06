import type { Sde, SdeType } from "@eveshipfit/sde-loader";

/** The words in the names of a ship's modes, in the order EVE shows them. */
const modeWords: readonly (readonly string[])[] = [
  ["Defense", "Primary"],
  ["Sharpshooter", "Secondary"],
  ["Propulsion", "Tertiary"],
];

/** The modes of a ship, in the order EVE shows them, the one it starts in first; empty for a ship without modes. */
export function modesOf(sde: Sde, ship: SdeType): readonly SdeType[] {
  const order = (mode: SdeType) => {
    const word = /(\S+) Mode$/.exec(mode.name)?.[1];
    const index = modeWords.findIndex((words) => word !== undefined && words.includes(word));
    return index === -1 ? modeWords.length : index;
  };
  return ship.modeTypeIds
    .map((id) => sde.type(id))
    .filter((mode) => mode !== undefined)
    .toSorted((a, b) => order(a) - order(b));
}
