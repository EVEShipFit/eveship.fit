import { formatNumber, type NumberFormat } from "@eveshipfit/react-hooks";

/** For the `format` of `useAttribute`. */
export function unit(suffix: string, divisor = 1) {
  return (value: number, format: NumberFormat) => `${formatNumber(value / divisor, format)}${suffix}`;
}
