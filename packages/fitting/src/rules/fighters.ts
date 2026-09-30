import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import type { Stats } from "../stats.js";
import type { Fit, ItemRef } from "../types.js";
import { baseValue } from "./attributes.js";

export type FighterKind = "light" | "support" | "heavy";

export const fighterKinds: readonly FighterKind[] = ["light", "support", "heavy"];

const kindAttributes: Record<FighterKind, { ship: string; structure: string }> = {
  light: { ship: "fighterSquadronIsLight", structure: "fighterSquadronIsStandupLight" },
  support: { ship: "fighterSquadronIsSupport", structure: "fighterSquadronIsStandupSupport" },
  heavy: { ship: "fighterSquadronIsHeavy", structure: "fighterSquadronIsStandupHeavy" },
};

/** The tubes of a kind a ship or a structure has, by attribute. */
export const kindTubes: Record<FighterKind, { ship: string; structure: string }> = {
  light: { ship: "fighterLightSlots", structure: "fighterStandupLightSlots" },
  support: { ship: "fighterSupportSlots", structure: "fighterStandupSupportSlots" },
  heavy: { ship: "fighterHeavySlots", structure: "fighterStandupHeavySlots" },
};

/** Which tubes a fighter squadron takes; `undefined` for what is not a fighter. */
export function fighterKind(sde: Sde, type: SdeType): FighterKind | undefined {
  return fighterKinds.find(
    (kind) => baseValue(sde, type, kindAttributes[kind].ship) || baseValue(sde, type, kindAttributes[kind].structure),
  );
}

/** Whether a fighter is launched from a structure. */
export function isStandupFighter(sde: Sde, type: SdeType): boolean {
  return fighterKinds.some((kind) => Boolean(baseValue(sde, type, kindAttributes[kind].structure)));
}

/** How many fighters make a full squadron. */
export function squadronSize(sde: Sde, type: SdeType): number {
  return baseValue(sde, type, "fighterSquadronMaxSize") ?? 1;
}

/** Whether a squadron of `type` can be launched from tube `index`, in place of what is there. */
export function tubeTakes(sde: Sde, fit: Fit, stats: Stats, type: SdeType, index: number): boolean {
  const kind = fighterKind(sde, type);
  if (kind === undefined || isStandupFighter(sde, type) !== stats.structure) return false;
  if (index < 0 || index >= stats.fighterTubes.all.total) return false;
  const replaced = tubeRef(fit, index);
  const replacedType = replaced === undefined ? undefined : sde.type(fit.items[replaced]!.type_id);
  const freed = replacedType !== undefined && fighterKind(sde, replacedType) === kind ? 1 : 0;
  const { used, total } = stats.fighterTubes[kind];
  return used - freed < total;
}

/** The lowest tube a squadron of `type` can be launched from without replacing another. */
export function firstFreeTube(sde: Sde, fit: Fit, stats: Stats, type: SdeType): number | undefined {
  for (let index = 0; index < stats.fighterTubes.all.total; index++) {
    if (tubeRef(fit, index) === undefined && tubeTakes(sde, fit, stats, type, index)) return index;
  }
  return undefined;
}

function tubeRef(fit: Fit, index: number): ItemRef | undefined {
  const ref = fit.items.findIndex((item) => item.slot.type === "fighter_tube" && item.slot.index === index);
  return ref === -1 ? undefined : ref;
}
