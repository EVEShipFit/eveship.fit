import type { EsiCharacters } from "@eveshipfit/react-hooks";

const KEY = "eveshipfit.character";
const CAN_SAVE_KEY = "eveshipfit.login-can-save";

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

/** Whether a login last asked to save fits. */
export function keptCanSave(): boolean {
  try {
    return localStorage.getItem(CAN_SAVE_KEY) === "true";
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function keepCanSave(canSave: boolean) {
  try {
    localStorage.setItem(CAN_SAVE_KEY, String(canSave));
  } catch (error) {
    console.error(error);
  }
}
