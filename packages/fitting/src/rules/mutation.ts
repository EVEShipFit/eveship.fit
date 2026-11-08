import type { Sde, SdeMutaplasmid, SdeType } from "@eveshipfit/sde-loader";

import type { Fit, FitItem, ItemRef } from "../types.js";
import { placementOf } from "./placement.js";

/** A mutated module or drone: what it was, the mutaplasmid, and the rolled value of each mutated attribute by attribute ID. */
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

const mutatedRacks: readonly string[] = ["high", "medium", "low", "drone_bay"];

/** Whether a module or drone can be mutated. */
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

/** The mutated drones of one type in the drone bay. */
export interface MutatedDrones {
  readonly refs: readonly ItemRef[];
  /** One per drone, the launched ones first. */
  readonly rolls: readonly MutationRoll[];
  /** How many of `rolls` are launched. */
  readonly active: number;
}

/** The drones mutated from `base`, each with the narrowest mutaplasmid that covers its roll. */
export function mutatedDronesOf(sde: Sde, fit: Fit, base: number): MutatedDrones | undefined {
  const refs = fit.items.flatMap((item, ref) =>
    item.slot.type === "drone_bay" && item.mutation?.base === base ? [ref] : [],
  );
  const items = refs.map((ref) => fit.items[ref]!);
  const launched = items.filter(({ state }) => state === "active");
  const rolled = [...launched, ...items.filter(({ state }) => state !== "active")].flatMap(
    ({ quantity = 1, mutation }) =>
      Array.from({ length: quantity }, () => Object.fromEntries(rolledValues(mutation?.attributes))),
  );

  const mutaplasmids = mutaplasmidsOf(sde, base).filter(({ id }) => mutatedTypeOf(sde, base, id) === items[0]?.type_id);
  const fallback = mutaplasmids[0];
  if (fallback === undefined) return undefined;

  return {
    refs,
    rolls: rolled.map((attributes) => {
      const mutaplasmid =
        mutaplasmids.find(({ id }) => rollFits(sde, { base, mutaplasmid: id, attributes })) ?? fallback;
      return completeRoll(sde, { base, mutaplasmid: mutaplasmid.id, attributes });
    }),
    active: launched.reduce((total, { quantity = 1 }) => total + quantity, 0),
  };
}

/** A value kept within what a mutaplasmid can roll. */
export function clampToRange(value: number, range: MutationRange): number {
  return Math.min(range.max, Math.max(range.min, value));
}

/** The roll on another mutaplasmid, every value as near as that one can roll it. */
export function withMutaplasmid(sde: Sde, roll: MutationRoll, mutaplasmid: number): MutationRoll {
  const attributes: Record<number, number> = {};
  for (const range of mutationRanges(sde, roll.base, mutaplasmid)) {
    attributes[range.attributeId] = clampToRange(roll.attributes[range.attributeId] ?? range.base, range);
  }
  return { base: roll.base, mutaplasmid, attributes };
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

/** A mutated module as Pyfa copies it: its name, the mutaplasmid's, and the rolled values by attribute name. */
export function parseMutationText(sde: Sde, text: string): MutationRoll | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length < 2 || lines.length > 3) return undefined;

  const base = sde.typeByName(lines[0]!.replace(/^\[\d+\]\s*/, ""));
  const mutaplasmid = sde.typeByName(lines[1]!);
  if (base === undefined || mutaplasmid === undefined) return undefined;
  if (mutatedTypeOf(sde, base.id, mutaplasmid.id) === undefined) return undefined;

  const attributes: Record<number, number> = {};
  for (const pair of lines[2]?.split(",") ?? []) {
    const match = /^(\S+)\s+(\S+)$/.exec(pair.trim());
    if (match === null) continue;
    const attributeId = sde.attributeId(match[1]!);
    const value = Number(match[2]);
    if (attributeId !== undefined && Number.isFinite(value)) attributes[attributeId] = value;
  }
  return completeRoll(sde, { base: base.id, mutaplasmid: mutaplasmid.id, attributes });
}

/** The type ID and item ID of an item, from an in-game item link or the two IDs. */
export function parseItemLink(text: string): { typeId: number; itemId: number } | undefined {
  const match = /showinfo:(\d+)\/\/(\d+)/.exec(text) ?? /^\s*(\d+)[\s,/]+(\d+)\s*$/.exec(text);
  if (match === null) return undefined;
  return { typeId: Number(match[1]), itemId: Number(match[2]) };
}
