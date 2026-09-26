import type { Sde } from "@eveshipfit/sde-loader";

import { Category } from "./ids.js";
import type { Character } from "./types.js";

/** A character with every published skill at `level`. */
export function allSkills(sde: Sde, level: number): Character {
  const skills: Record<number, number> = {};
  for (const type of sde.types()) {
    if (type.categoryId === Category.Skill && type.published) skills[type.id] = level;
  }
  return { skills };
}
