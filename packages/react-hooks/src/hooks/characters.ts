import type { Character } from "@eveshipfit/fitting";

import { CharacterContext, useRequiredContext } from "../context.js";
import { useFitStore } from "./fit.js";
import { useEngine } from "./sde.js";

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
