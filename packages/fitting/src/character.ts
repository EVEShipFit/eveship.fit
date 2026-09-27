import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import { Category } from "./ids.js";
import { baseValue } from "./rules/attributes.js";
import type { Character } from "./types.js";

/** A character with every published skill at `level`. */
export function allSkills(sde: Sde, level: number): Character {
  const skills: Record<number, number> = {};
  for (const type of sde.types()) {
    if (type.categoryId === Category.Skill && type.published) skills[type.id] = level;
  }
  return { skills };
}

/** A skill trained below the level something asks of it. */
export interface MissingSkill {
  readonly type_id: number;
  readonly required: number;
  readonly level: number;
}

const requiredSkills = [
  ["requiredSkill1", "requiredSkill1Level"],
  ["requiredSkill2", "requiredSkill2Level"],
  ["requiredSkill3", "requiredSkill3Level"],
  ["requiredSkill4", "requiredSkill4Level"],
  ["requiredSkill5", "requiredSkill5Level"],
  ["requiredSkill6", "requiredSkill6Level"],
] as const;

/** The skills, and the skills those need, that `character` lacks to use `typeIds`. */
export function missingSkills(sde: Sde, character: Character, typeIds: Iterable<number>): MissingSkill[] {
  const wanted = new Map<number, number>();
  const note = (type: SdeType | undefined) => {
    if (type === undefined) return;
    for (const [skill, level] of requiredSkills) {
      const skillId = baseValue(sde, type, skill);
      if (skillId === undefined) continue;
      wanted.set(skillId, Math.max(wanted.get(skillId) ?? 0, baseValue(sde, type, level) ?? 0));
    }
  };

  for (const typeId of typeIds) note(sde.type(typeId));
  // A Map visits what is added while it is walked, and each key once.
  for (const skillId of wanted.keys()) note(sde.type(skillId));

  const missing: MissingSkill[] = [];
  for (const [skillId, required] of wanted) {
    const level = trainedLevel(character, skillId);
    if (level < required) missing.push({ type_id: skillId, required, level });
  }
  return missing;
}

function trainedLevel({ skills }: Character, skillId: number): number {
  return (skills instanceof Map ? skills.get(skillId) : skills?.[skillId]) ?? 0;
}
