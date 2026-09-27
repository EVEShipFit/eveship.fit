import { formatNumber, type NumberFormat } from "@eveshipfit/react-hooks";

/** A `format` for `useAttribute`: the value divided by `divisor`, followed by `suffix` as is. */
export function unit(suffix: string, divisor = 1) {
  return (value: number, format: NumberFormat) => `${formatNumber(value / divisor, format)}${suffix}`;
}
