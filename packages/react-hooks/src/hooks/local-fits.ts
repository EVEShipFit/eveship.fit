import type { Fit } from "@eveshipfit/fitting";
import { useContext, useSyncExternalStore } from "react";

import { CharacterContext, EsiCharactersContext, LocalFitsContext, useRequiredContext } from "../context.js";
import type { EsiCharacter } from "../esi-characters.js";
import type { FitOwner } from "../local-fits.js";
import { useEsiCharacters } from "./characters.js";

export interface LocalFitsControls {
  readonly fits: readonly Fit[];
  readonly save: (fit: Fit) => void;
  readonly remove: (fit: Fit) => void;
}

export interface PersonalFitsValue {
  /** The fittings of the character flying the fit. */
  readonly fits: readonly Fit[];
  /** The logged-in character flying the fit; undefined for All L5 and All L0. */
  readonly character: EsiCharacter | undefined;
}

export interface FitSavingValue {
  /** The logged-in characters; undefined without the provider's `characters`. */
  readonly characters: readonly EsiCharacter[] | undefined;
  /** Who saves go to: a character, or undefined for the browser. */
  readonly target: EsiCharacter | undefined;
  /** The fits saves replace, those of `target`. */
  readonly fits: readonly Fit[];
  /** From now on, saves go here. */
  readonly pick: (owner: FitOwner) => void;
  /** Saves the fit to `target`; with `replace`, in place of the character's fit with the same hull and name. */
  readonly save: (fit: Fit, replace?: boolean) => Promise<void>;
}

const noFits: readonly Fit[] = [];

export function useLocalFits(): LocalFitsControls {
  const localFits = useRequiredContext(LocalFitsContext);
  const fits = useSyncExternalStore(localFits.subscribe, localFits.list);

  return {
    fits,
    save: (fit) => void localFits.save(fit),
    remove: (fit) => void localFits.remove(fit),
  };
}

/** Whether saves can go to this character. */
export function canSaveFits(character: EsiCharacter): boolean {
  return character.canWriteFits && character.status !== "expired";
}

export function useFitSaving(): FitSavingValue {
  const localFits = useRequiredContext(LocalFitsContext);
  const esiCharacters = useContext(EsiCharactersContext);
  const logins = useEsiCharacters(esiCharacters);
  const { current, saveTo, setSaveTo } = useRequiredContext(CharacterContext);
  const writable = logins.filter(canSaveFits);
  const target = writable.find((login) => (saveTo === undefined ? String(login.id) === current : login.id === saveTo));
  const fits = useSyncExternalStore(localFits.subscribe, () => localFits.list(target?.id));

  return {
    characters: esiCharacters && logins,
    target,
    fits,
    pick: setSaveTo,
    save: (fit, replace) =>
      target === undefined ? localFits.save(fit) : esiCharacters!.saveFit(target.id, fit, replace),
  };
}

export function usePersonalFits(): PersonalFitsValue {
  const localFits = useRequiredContext(LocalFitsContext);
  const { current } = useRequiredContext(CharacterContext);
  const character = useEsiCharacters(useContext(EsiCharactersContext)).find((login) => String(login.id) === current);
  const fits = useSyncExternalStore(localFits.subscribe, () =>
    character === undefined ? noFits : localFits.list(character.id),
  );

  return { fits, character };
}
