import { formatNumber, type NumberFormat } from "@eveshipfit/react-hooks";

/** For the `format` of `useAttribute`. */
export function unit(suffix: string, divisor = 1) {
  return (value: number, format: NumberFormat) => `${formatNumber(value / divisor, format)}${suffix}`;
}

/** Like EVE's "0.11B hp": in billions above 100 million, in millions above 100 thousand. */
export function hitpoints(value: number, format: NumberFormat): string {
  const short = { ...format, decimals: 2, fixed: true, rounding: "nearest" } as const;
  if (value > 100_000_000) return unit("B hp", 1_000_000_000)(value, short);
  if (value > 100_000) return unit("M hp", 1_000_000)(value, short);
  return unit(" hp")(value, format);
}

/** Like EVE's ranges: in meters below 10 km, in kilometers above. */
export function range(value: number, format: NumberFormat): string {
  if (value < 10_000) return unit(" m")(value, format);
  return unit(" km", 1000)(value, format);
}
