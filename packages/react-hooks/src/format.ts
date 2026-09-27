import type { Sde } from "@eveshipfit/sde-loader";

export type Rounding = "down" | "up" | "nearest";

export interface NumberFormat {
  /** The most decimals to show. */
  decimals?: number;
  /** Keep trailing zeros. */
  fixed?: boolean;
  /** Group thousands with commas; on by default. */
  grouping?: boolean;
  /** To the nearest by default. */
  rounding?: Rounding;
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(decimals: number, fixed: boolean, grouping: boolean): Intl.NumberFormat {
  const key = `${decimals},${fixed},${grouping}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: fixed ? decimals : 0,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
      signDisplay: "negative",
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

function round(value: number, decimals: number, rounding: Rounding): number {
  const scale = 10 ** decimals;
  const scaled = value * scale;
  const nearest = Math.sign(scaled) * Math.round(Math.abs(scaled));
  // The SDE stores 32-bit floats: 0.2 comes out as 0.19999999, which should not round down to 0.1.
  if (rounding === "nearest" || Math.abs(scaled - nearest) <= Math.abs(scaled) * 1e-6) return nearest / scale;
  return (rounding === "down" ? Math.floor(scaled) : Math.ceil(scaled)) / scale;
}

export function formatNumber(
  value: number,
  { decimals = 2, fixed = false, grouping = true, rounding = "nearest" }: NumberFormat = {},
): string {
  return formatterFor(decimals, fixed, grouping).format(round(value, decimals, rounding));
}

/** Like "1h 2m 3s". */
export function formatDuration(seconds: number, rounding: Rounding = "nearest"): string {
  const { hours, minutes, secs } = split(seconds, rounding);
  const parts = [hours && `${hours}h`, minutes && `${minutes}m`, secs && `${secs}s`].filter(Boolean);
  return parts.length === 0 ? "0s" : parts.join(" ");
}

/** Like "01:02:03". */
export function formatClock(seconds: number, rounding: Rounding = "nearest"): string {
  const { hours, minutes, secs } = split(seconds, rounding);
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
}

function split(seconds: number, rounding: Rounding) {
  const total = round(seconds, 0, rounding);
  return { hours: Math.floor(total / 3600), minutes: Math.floor(total / 60) % 60, secs: total % 60 };
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

/** Shown as 1 - value, so better stored is worse shown. */
const invertedUnits = new Set<number>([Unit.InverseAbsolutePercent, Unit.InversedModifierPercent]);

/** Towards worse, so a fit never looks better than it is. */
export function roundingOf(sde: Sde, attributeId: number): Rounding {
  const attribute = sde.attribute(attributeId);
  if (attribute === undefined) return "nearest";
  return attribute.highIsGood !== invertedUnits.has(attribute.unitId) ? "down" : "up";
}

const sizeClasses: Record<number, string> = { 1: "Small", 2: "Medium", 3: "Large", 4: "X-Large" };

/** An attribute's value the way EVE shows it: converted, rounded, with its unit. */
export function formatAttribute(sde: Sde, attributeId: number, value: number, format: NumberFormat = {}): string {
  const unit = sde.unit(sde.attribute(attributeId)?.unitId ?? 0);
  const rounded = { ...format, rounding: format.rounding ?? roundingOf(sde, attributeId) };
  const number = (shown: number, suffix = unit?.displayName) =>
    suffix ? `${formatNumber(shown, rounded)} ${suffix}` : formatNumber(shown, rounded);

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
