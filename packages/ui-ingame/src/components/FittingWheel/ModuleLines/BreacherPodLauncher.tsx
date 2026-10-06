import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { FlightRange } from "./parts/flightRange";
import type { LineProps } from "./index";

export function BreacherPodLauncher({ itemRef }: LineProps) {
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
      <FlightRange itemRef={itemRef} />
      <Attribute name="launcherHardPointModifier">Damage Per Second 0.0</Attribute>
      {dot.value !== undefined && <Attribute name="dotMaxDamagePerTick">Damage Per Second {dot.text}</Attribute>}
      {duration.value !== undefined && (
        <Attribute name="dotDuration">Damage effect duration: {duration.text}</Attribute>
      )}
    </>
  );
}
