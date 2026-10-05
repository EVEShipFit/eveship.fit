import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import type { LineProps } from "./index";
import { Range } from "./parts/Range";

const meters = unit(" m");

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
      <Range itemRef={itemRef} falloff="falloff" label="Falloff range" format={meters} />
      <Attribute name="damageMultiplier">Damage Per Second {dps.text}</Attribute>
      <Damage itemRef={itemRef} />
      <Attribute name="trackingSpeed">Turret Tracking: {tracking.text}</Attribute>
    </>
  );
}

export function VortonProjector({ itemRef }: LineProps) {
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: formatNumber,
  });

  return (
    <>
      <Range itemRef={itemRef} label="Optimal range" format={range} />
      <Attribute name="damageMultiplier">Damage Per Second {dps.text}</Attribute>
      <Damage itemRef={itemRef} />
    </>
  );
}
