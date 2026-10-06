import type { ItemRef } from "@eveshipfit/fitting";
import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { Attribute } from "./Attribute";

/** "Damage Per Second 57.5"; a range like "134.2-419.3" for weapons that spool up. */
export function DamagePerSecond({
  itemRef,
  icon,
  decimals = 1,
}: {
  itemRef: ItemRef;
  icon: string;
  decimals?: number;
}) {
  const spool = useAttribute("damageMultiplierBonusMax", { of: itemRef }).value;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals,
    fixed: true,
    fallback: 0,
    format: (value, format) =>
      spool && value
        ? `${formatNumber(value / (1 + spool), format)}-${formatNumber(value, format)}`
        : formatNumber(value, format),
  });
  return <Attribute name={icon}>Damage Per Second {dps.text}</Attribute>;
}
