import type { Fit } from "@eveshipfit/fitting";
import { useContext, useSyncExternalStore } from "react";

import { CharacterContext, EsiCharactersContext, LocalFitsContext, useRequiredContext } from "../context.js";
import type { EsiCharacter } from "../esi-characters.js";
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

export function usePersonalFits(): PersonalFitsValue {
  const localFits = useRequiredContext(LocalFitsContext);
  const { current } = useRequiredContext(CharacterContext);
  const character = useEsiCharacters(useContext(EsiCharactersContext)).find((login) => String(login.id) === current);
  const fits = useSyncExternalStore(localFits.subscribe, () =>
    character === undefined ? noFits : localFits.list(character.id),
  );

  return { fits, character };
}
