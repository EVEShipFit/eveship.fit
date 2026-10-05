import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute } from "./Attribute";
import { Damage } from "./Damage";
import type { LineProps } from "./index";
import { Range } from "./Range";

export function Turret({ itemRef }: LineProps) {
  const spool = useAttribute("damageMultiplierBonusMax", { of: itemRef }).value;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: (value, format) =>
      spool
        ? `${formatNumber(value / (1 + spool), format)}-${formatNumber(value, format)}`
        : formatNumber(value, format),
  });
  const tracking = useAttribute("trackingSpeed", { of: itemRef, decimals: 2, fixed: true });

  return (
    <>
      <Range itemRef={itemRef} falloff="falloff" label="Falloff range" format={unit(" m")} />
      <Attribute name="damageMultiplier">Damage Per Second {dps.text}</Attribute>
      <Damage itemRef={itemRef} />
      <Attribute name="trackingSpeed">Turret Tracking: {tracking.text}</Attribute>
    </>
  );
}
