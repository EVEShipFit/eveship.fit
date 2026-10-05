import type { ItemRef } from "@eveshipfit/fitting";
import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../../ShipStatistics/units";
import { Attribute } from "./Attribute";

/** Like "180 GJ neutralized per 12s". */
export function PerCycle({
  itemRef,
  name,
  label,
  charge = false,
  multiplier = 1,
  decimals = 0,
}: {
  itemRef: ItemRef;
  name: string;
  label: string;
  charge?: boolean;
  multiplier?: number;
  decimals?: number;
}) {
  const amount = useAttribute(name, {
    of: itemRef,
    charge,
    decimals,
    fixed: true,
    format: (value, format) => formatNumber(value * multiplier, format),
  });
  const duration = useAttribute("duration", { of: itemRef, format: unit("s", 1000) });
  if (amount.value === undefined) return null;

  return (
    <Attribute name={name}>
      {amount.text} {label} per {duration.text}
    </Attribute>
  );
}
