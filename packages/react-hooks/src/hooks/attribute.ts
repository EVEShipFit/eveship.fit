import type { Attributes, ItemRef, Stats } from "@eveshipfit/fitting";

import { formatAttribute, type NumberFormat } from "../format.js";
import { useShownSnapshot, useSnapshot } from "./fit.js";
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
  /** Whether the fit's boosters changed the value. */
  readonly boosted: boolean;
}

export function useAttribute(name: string, options: AttributeOptions = {}): AttributeValue {
  const sde = useSde();
  const { stats: shown, unboosted } = useShownSnapshot();
  const current = useSnapshot().stats;

  const attribute = sde.attribute(sde.attributeId(name) ?? 0);
  const value = attribute && (attributesOf(shown, options)?.get(attribute.id) ?? options.fallback);
  if (attribute === undefined || value === undefined)
    return { value: undefined, text: "–", change: undefined, boosted: false };

  const { decimals, fixed, grouping, rounding } = options;
  const format = { decimals, fixed, grouping, rounding };
  const text = options.format?.(value, format) ?? formatAttribute(sde, attribute.id, value, format);
  const before = shown === current ? value : (attributesOf(current, options)?.get(attribute.id) ?? options.fallback);
  const boosted =
    unboosted !== undefined && value !== (attributesOf(unboosted, options)?.get(attribute.id) ?? options.fallback);
  if (before === undefined || before === value) return { value, text, change: undefined, boosted };

  return { value, text, change: value > before === attribute.highIsGood ? "better" : "worse", boosted };
}

function attributesOf(stats: Stats, { of = "ship", charge = false }: AttributeOptions): Attributes | undefined {
  if (of === "ship") return stats.ship;
  if (of === "character") return stats.character;
  const item = stats.items[of];
  return charge ? item?.charge : item?.attributes;
}
