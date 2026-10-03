import {
  missingSkills,
  typesInUse,
  type Character,
  type Engine,
  type Fit,
  type FitStore,
  type MissingSkill,
} from "@eveshipfit/fitting";
import { useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { CharacterContext, EsiCharactersContext, useRequiredContext } from "../context.js";
import type { EsiCharacter, EsiCharacters } from "../esi-characters.js";
import { useFitStore } from "./fit.js";
import { useSde } from "./sde.js";

export const ALL_SKILLS_V = "all-skills-v";
const NO_SKILLS = "no-skills";

export interface CharacterChoice {
  readonly id: string;
  readonly name: string;
  /** Undefined for All L5 and All L0. */
  readonly login: EsiCharacter | undefined;
}

export interface CharactersControls {
  /** The logged-in characters, then All L5 and All L0. */
  readonly characters: readonly CharacterChoice[];
  readonly current: string;
  /** Fly the fit with this character. */
  readonly select: (id: string) => void;
  /** Sends the browser to EVE's login; undefined without the provider's `characters`. */
  readonly login: (() => void) | undefined;
  /** Loads a logged-in character's skills again. */
  readonly refresh: (id: string) => void;
  /** Forgets a logged-in character. */
  readonly remove: (id: string) => void;
}

const generic: readonly CharacterChoice[] = [
  { id: ALL_SKILLS_V, name: "All L5", login: undefined },
  { id: NO_SKILLS, name: "All L0", login: undefined },
];

const noSkills: Character = { skills: {} };
const noCharacters: readonly EsiCharacter[] = [];
const noSubscribe = () => () => {};

export function useCharacters(): CharactersControls {
  const esiCharacters = useContext(EsiCharactersContext);
  const logins = useEsiCharacters(esiCharacters);
  const { current, setCurrent } = useRequiredContext(CharacterContext);

  return {
    characters: [...logins.map((login) => ({ id: String(login.id), name: login.name, login })), ...generic],
    current,
    select: (id) => {
      if (esiCharacters !== undefined && !generic.some((choice) => choice.id === id)) esiCharacters.load(Number(id));
      setCurrent(id);
    },
    login:
      esiCharacters &&
      (() => {
        esiCharacters.login().then(
          (url) => location.assign(url),
          (error: unknown) => console.error(error),
        );
      }),
    refresh: (id) => esiCharacters?.refresh(Number(id)),
    remove: (id) => {
      esiCharacters?.remove(Number(id));
      if (id === current) setCurrent(ALL_SKILLS_V);
    },
  };
}

/** Flies the fit with the character `current` names, once it is picked or `given`. */
export function useFlyCharacter(
  engine: Engine,
  store: FitStore,
  esiCharacters: EsiCharacters | undefined,
  current: string,
  given: boolean,
) {
  const logins = useEsiCharacters(esiCharacters);
  const skills = logins.find((login) => String(login.id) === current)?.skills;
  const character = useMemo((): Character => {
    if (current === ALL_SKILLS_V) return engine.defaultCharacter;
    if (current === NO_SKILLS || skills === undefined) return noSkills;
    return { skills };
  }, [engine, current, skills]);
  const flown = useRef(given ? undefined : character);

  useEffect(() => {
    if (flown.current === character) return;
    flown.current = character;
    store.setCharacter(character);
  }, [store, character]);
}

function useEsiCharacters(esiCharacters: EsiCharacters | undefined): readonly EsiCharacter[] {
  return useSyncExternalStore(esiCharacters?.subscribe ?? noSubscribe, esiCharacters?.list ?? (() => noCharacters));
}

/** The skills the fit's character lacks to use some types, or a whole fit; empty when it has them all. */
export function useMissingSkills(): (types: Iterable<number> | Fit) => readonly MissingSkill[] {
  const sde = useSde();
  const store = useFitStore();
  const character = useSyncExternalStore(store.subscribe, () => store.character);
  return (types) => missingSkills(sde, character, "ship" in types ? typesInUse(types) : types);
}
