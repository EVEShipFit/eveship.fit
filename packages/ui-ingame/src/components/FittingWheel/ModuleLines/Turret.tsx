import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import type { LineProps } from "./index";
import { Range } from "./parts/Range";

const meters = unit(" m");

export function Turret({ itemRef }: LineProps) {
  const tracking = useAttribute("trackingSpeed", { of: itemRef, decimals: 2, fixed: true });

  return (
    <>
      <Range itemRef={itemRef} falloff="falloff" label="Falloff range" format={meters} />
      <DamagePerSecond itemRef={itemRef} icon="damageMultiplier" />
      <Damage itemRef={itemRef} />
      <Attribute name="trackingSpeed">Turret Tracking: {tracking.text}</Attribute>
    </>
  );
}

export function VortonProjector({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Optimal range" format={range} />
      <DamagePerSecond itemRef={itemRef} icon="damageMultiplier" />
      <Damage itemRef={itemRef} />
    </>
  );
}
