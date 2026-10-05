import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

const kilometers = unit(" km", 1000);

export function TractorBeam({ itemRef }: LineProps) {
  const velocity = useAttribute("maxTractorVelocity", { of: itemRef, decimals: 0, format: unit(" m/s") });
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={kilometers} />
      <Attribute name="maxTractorVelocity">
        {velocity.text} {useDisplayName("maxTractorVelocity")}
      </Attribute>
    </>
  );
}
