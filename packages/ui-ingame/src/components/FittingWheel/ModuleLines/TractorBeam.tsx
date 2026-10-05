import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function TractorBeam({ itemRef }: LineProps) {
  const velocity = useAttribute("maxTractorVelocity", { of: itemRef, decimals: 0, format: unit(" m/s") });
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <Attribute name="maxTractorVelocity">
        {velocity.text} {useDisplayName("maxTractorVelocity")}
      </Attribute>
    </>
  );
}
