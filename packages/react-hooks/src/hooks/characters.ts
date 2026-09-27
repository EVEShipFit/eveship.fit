import { missingSkills, typesInUse, type Character, type Fit, type MissingSkill } from "@eveshipfit/fitting";
import { useSyncExternalStore } from "react";

import { CharacterContext, useRequiredContext } from "../context.js";
import { useFitStore } from "./fit.js";
import { useEngine, useSde } from "./sde.js";

export const ALL_SKILLS_V = "all-skills-v";
const NO_SKILLS = "no-skills";

export interface CharacterChoice {
  readonly id: string;
  readonly name: string;
}

export interface CharactersControls {
  readonly characters: readonly CharacterChoice[];
  readonly current: string;
  /** Fly the fit with this character. */
  readonly select: (id: string) => void;
}

const characters: readonly CharacterChoice[] = [
  { id: ALL_SKILLS_V, name: "All Skills V" },
  { id: NO_SKILLS, name: "No Skills" },
];

export function useCharacters(): CharactersControls {
  const engine = useEngine();
  const store = useFitStore();
  const { current, setCurrent } = useRequiredContext(CharacterContext);

  const characterFor = (id: string): Character => {
    if (id === ALL_SKILLS_V) return engine.defaultCharacter;
    if (id === NO_SKILLS) return { skills: {} };
    throw new Error(`No character ${id}`);
  };

  return {
    characters,
    current,
    select: (id) => {
      store.setCharacter(characterFor(id));
      setCurrent(id);
    },
  };
}

/** The skills the fit's character lacks to use some types, or a whole fit; empty when it has them all. */
export function useMissingSkills(): (types: Iterable<number> | Fit) => readonly MissingSkill[] {
  const sde = useSde();
  const store = useFitStore();
  const character = useSyncExternalStore(store.subscribe, () => store.character);
  return (types) => missingSkills(sde, character, "ship" in types ? typesInUse(types) : types);
}
