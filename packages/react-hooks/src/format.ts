import type { Sde } from "@eveshipfit/sde-loader";

export interface NumberFormat {
  /** The most decimals to show; trailing zeros are dropped. */
  decimals?: number;
}

const formatters = new Map<number, Intl.NumberFormat>();

export function formatNumber(value: number, { decimals = 2 }: NumberFormat = {}): string {
  let formatter = formatters.get(decimals);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals });
    formatters.set(decimals, formatter);
  }
  return formatter.format(value);
}

/** Dogma unit IDs whose values are shown differently from how they are stored. */
const Unit = {
  Meter: 1,
  Milliseconds: 101,
  InverseAbsolutePercent: 108,
  ModifierPercent: 109,
  InversedModifierPercent: 111,
  GroupId: 115,
  TypeId: 116,
  SizeClass: 117,
  AbsolutePercent: 127,
  Boolean: 137,
} as const;

const sizeClasses: Record<number, string> = { 1: "Small", 2: "Medium", 3: "Large", 4: "X-Large" };

/** An attribute's value the way EVE shows it: converted, rounded, with its unit. */
export function formatAttribute(sde: Sde, attributeId: number, value: number, format: NumberFormat = {}): string {
  const unit = sde.unit(sde.attribute(attributeId)?.unitId ?? 0);
  const number = (shown: number, suffix = unit?.displayName) =>
    suffix ? `${formatNumber(shown, format)} ${suffix}` : formatNumber(shown, format);

  switch (unit?.id) {
    case Unit.Meter:
      return value >= 10_000 ? number(value / 1000, "km") : number(value, "m");
    case Unit.Milliseconds:
      return number(value / 1000, "s");
    case Unit.InverseAbsolutePercent:
    case Unit.InversedModifierPercent:
      return number((1 - value) * 100, "%");
    case Unit.ModifierPercent:
      return number((value - 1) * 100, "%");
    case Unit.AbsolutePercent:
      return number(value * 100, "%");
    case Unit.GroupId:
      return sde.group(value)?.name ?? number(value, "");
    case Unit.TypeId:
      return sde.type(value)?.name ?? number(value, "");
    case Unit.SizeClass:
      return sizeClasses[value] ?? number(value, "");
    case Unit.Boolean:
      return value ? "Yes" : "No";
    default:
      return number(value);
  }
}
