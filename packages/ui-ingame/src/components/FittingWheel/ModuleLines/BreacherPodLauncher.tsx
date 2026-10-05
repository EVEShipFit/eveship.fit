import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import type { LineProps } from "./index";

export function BreacherPodLauncher({ itemRef }: LineProps) {
  const velocity = useAttribute("maxVelocity", { of: itemRef, charge: true }).value;
  const flightTime = useAttribute("explosionDelay", { of: itemRef, charge: true }).value;
  const dot = useAttribute("dotMaxDamagePerTick", {
    of: itemRef,
    charge: true,
    decimals: 1,
    fixed: true,
    format: formatNumber,
  });
  const duration = useAttribute("dotDuration", { of: itemRef, charge: true, decimals: 1, format: unit("s", 1000) });

  return (
    <>
      {velocity !== undefined && flightTime !== undefined && (
        <Attribute name="maxRange">Range within {range((velocity * flightTime) / 1000, { decimals: 0 })}</Attribute>
      )}
      <Attribute name="launcherHardPointModifier">Damage Per Second 0.0</Attribute>
      {dot.value !== undefined && <Attribute name="dotMaxDamagePerTick">Damage Per Second {dot.text}</Attribute>}
      {duration.value !== undefined && (
        <Attribute name="dotDuration">Damage effect duration: {duration.text}</Attribute>
      )}
    </>
  );
}
