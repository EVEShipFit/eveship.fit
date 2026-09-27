import type { Attributes, ItemRef, Stats } from "@eveshipfit/fitting";

import { formatAttribute, roundingOf, type NumberFormat } from "../format.js";
import { useSnapshot, useStats } from "./fit.js";
import { useSde } from "./sde.js";

export interface AttributeOptions extends NumberFormat {
  /** Whose attribute; the ship's when left out. */
  of?: "ship" | "character" | ItemRef;
  /** With `of` an item: read the attribute from its charge instead. */
  charge?: boolean;
  /** The value when nothing sets the attribute, like a load nothing adds to. */
  fallback?: number;
  /** How to show the value; `formatAttribute` when left out. */
  format?: (value: number, format: NumberFormat) => string;
}

export interface AttributeValue {
  readonly value: number | undefined;
  readonly text: string;
  /** How a preview would change the value, if it would. */
  readonly change: "better" | "worse" | undefined;
}

export function useAttribute(name: string, options: AttributeOptions = {}): AttributeValue {
  const sde = useSde();
  const shown = useStats();
  const current = useSnapshot().stats;

  const attribute = sde.attribute(sde.attributeId(name) ?? 0);
  const value = attribute && (attributesOf(shown, options)?.get(attribute.id) ?? options.fallback);
  if (attribute === undefined || value === undefined) return { value: undefined, text: "–", change: undefined };

  const { decimals, fixed, grouping, rounding = roundingOf(sde, attribute.id) } = options;
  const format = { decimals, fixed, grouping, rounding };
  const text = options.format?.(value, format) ?? formatAttribute(sde, attribute.id, value, format);
  const before = shown === current ? value : (attributesOf(current, options)?.get(attribute.id) ?? options.fallback);
  if (before === undefined || before === value) return { value, text, change: undefined };

  return { value, text, change: value > before === attribute.highIsGood ? "better" : "worse" };
}

function attributesOf(stats: Stats, { of = "ship", charge = false }: AttributeOptions): Attributes | undefined {
  if (of === "ship") return stats.ship;
  if (of === "character") return stats.character;
  const item = stats.items[of];
  return charge ? item?.charge : item?.attributes;
}
