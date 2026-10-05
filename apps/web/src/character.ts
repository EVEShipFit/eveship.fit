import type { EsiCharacters } from "@eveshipfit/react-hooks";

const KEY = "eveshipfit.character";

/** The character last picked, as `useCharacters` lists it; undefined when it is no longer logged in. */
export function keptCharacter(characters: EsiCharacters | undefined): string | undefined {
  try {
    const kept = localStorage.getItem(KEY);
    if (kept === null) return undefined;
    if (!/^\d+$/.test(kept)) return kept;
    return characters?.list().some((character) => String(character.id) === kept) ? kept : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export function keepCharacter(character: string) {
  try {
    localStorage.setItem(KEY, character);
  } catch (error) {
    console.error(error);
  }
}
