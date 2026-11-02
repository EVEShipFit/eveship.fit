import type { Sde, SdeMutaplasmid, SdeType } from "@eveshipfit/sde-loader";

import type { FitItem } from "../types.js";
import { placementOf } from "./placement.js";

/** A mutated module: what it was, the mutaplasmid, and the rolled value of each mutated attribute by attribute ID. */
export interface MutationRoll {
  readonly base: number;
  readonly mutaplasmid: number;
  readonly attributes: Readonly<Record<number, number>>;
}

/** How far a mutaplasmid can roll an attribute of a type, in the attribute's own values. */
export interface MutationRange {
  readonly attributeId: number;
  /** Before mutation. */
  readonly base: number;
  readonly min: number;
  readonly max: number;
  readonly highIsGood: boolean;
}

const mutatedRacks: readonly string[] = ["high", "medium", "low"];

/** Whether a module can be mutated. */
export function canMutate(sde: Sde, type: SdeType): boolean {
  const rack = placementOf(sde, type)?.type;
  return rack !== undefined && mutatedRacks.includes(rack) && sde.mutaplasmidsFor(type.id).length > 0;
}

/** The mutaplasmids that work on a type, the one that rolls least first. */
export function mutaplasmidsOf(sde: Sde, typeId: number): SdeMutaplasmid[] {
  const width = (mutaplasmid: SdeMutaplasmid) =>
    mutationRanges(sde, typeId, mutaplasmid.id).reduce(
      (total, range) => total + (range.max - range.min) / Math.abs(range.base || 1),
      0,
    );
  return sde
    .mutaplasmidsFor(typeId)
    .map((mutaplasmid) => ({ mutaplasmid, width: width(mutaplasmid) }))
    .toSorted((a, b) => a.width - b.width)
    .map(({ mutaplasmid }) => mutaplasmid);
}

/** The type a mutaplasmid turns a type into. */
export function mutatedTypeOf(sde: Sde, base: number, mutaplasmid: number): number | undefined {
  const mapping = sde
    .mutaplasmid(mutaplasmid)
    ?.mappings.find(({ applicableTypeIds }) => applicableTypeIds.includes(base));
  return mapping?.resultingTypeId;
}

/** The attributes a mutaplasmid rolls on a type, in the order of the SDE. */
export function mutationRanges(sde: Sde, base: number, mutaplasmid: number): MutationRange[] {
  const type = sde.type(base);
  const plasmid = sde.mutaplasmid(mutaplasmid);
  if (type === undefined || plasmid === undefined) return [];

  return [...plasmid.attributes].flatMap(([attributeId, range]) => {
    const value = type.attributes.get(attributeId) ?? sde.attribute(attributeId)?.defaultValue;
    if (value === undefined) return [];
    const ends = [value * range.min, value * range.max];
    return [
      {
        attributeId,
        base: value,
        min: Math.min(...ends),
        max: Math.max(...ends),
        highIsGood: sde.attribute(attributeId)?.highIsGood ?? true,
      },
    ];
  });
}

/** Whether the mutaplasmid works on the module and can have rolled every value. */
export function rollFits(sde: Sde, roll: MutationRoll): boolean {
  const ranges = mutationRanges(sde, roll.base, roll.mutaplasmid);
  return ranges.length > 0 && ranges.every((range) => inRange(range, roll.attributes[range.attributeId]));
}

function inRange(range: MutationRange, value: number | undefined): boolean {
  const slack = (range.max - range.min) * 1e-6;
  return value === undefined || (value >= range.min - slack && value <= range.max + slack);
}

export type RollKind = "base" | "worst" | "best" | "random";

/** Every attribute at its base value, its worst or best end, or rolled at random as EVE does. */
export function rollMutation(
  sde: Sde,
  base: number,
  mutaplasmid: number,
  kind: RollKind,
  random: () => number = Math.random,
): MutationRoll {
  const attributes: Record<number, number> = {};
  for (const range of mutationRanges(sde, base, mutaplasmid)) {
    const good = range.highIsGood ? range.max : range.min;
    const bad = range.highIsGood ? range.min : range.max;
    attributes[range.attributeId] =
      kind === "base"
        ? range.base
        : kind === "best"
          ? good
          : kind === "worst"
            ? bad
            : range.min + random() * (range.max - range.min);
  }
  return { base, mutaplasmid, attributes };
}

/** The roll of a mutated item, with the narrowest mutaplasmid that covers it. */
export function mutationRollOf(sde: Sde, item: FitItem): MutationRoll | undefined {
  const { mutation } = item;
  if (mutation === undefined) return undefined;
  const rolled = Object.fromEntries(rolledValues(mutation.attributes));
  const mutaplasmids = mutaplasmidsOf(sde, mutation.base).filter(
    ({ id }) => mutatedTypeOf(sde, mutation.base, id) === item.type_id,
  );
  const fitting = mutaplasmids.find(({ id }) =>
    rollFits(sde, { base: mutation.base, mutaplasmid: id, attributes: rolled }),
  );
  const mutaplasmid = fitting ?? mutaplasmids[0];
  return mutaplasmid && completeRoll(sde, { base: mutation.base, mutaplasmid: mutaplasmid.id, attributes: rolled });
}

/** Only the attributes the mutaplasmid rolls; a missing one at its base value. */
export function completeRoll(sde: Sde, roll: MutationRoll): MutationRoll {
  const attributes: Record<number, number> = {};
  for (const range of mutationRanges(sde, roll.base, roll.mutaplasmid)) {
    attributes[range.attributeId] = roll.attributes[range.attributeId] ?? range.base;
  }
  return { ...roll, attributes };
}

export function rolledValues(
  attributes: Map<number, number> | Record<number, number> | undefined,
): Map<number, number> {
  if (attributes instanceof Map) return attributes;
  return new Map(Object.entries(attributes ?? {}).map(([id, value]) => [Number(id), value]));
}

/** The type ID and item ID of an item, from an in-game item link or the two IDs. */
export function parseItemLink(text: string): { typeId: number; itemId: number } | undefined {
  const match = /showinfo:(\d+)\/\/(\d+)/.exec(text) ?? /^\s*(\d+)[\s,/]+(\d+)\s*$/.exec(text);
  if (match === null) return undefined;
  return { typeId: Number(match[1]), itemId: Number(match[2]) };
}
