import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function StasisWebifier({ itemRef }: LineProps) {
  const reduction = useAttribute("speedFactor", {
    of: itemRef,
    decimals: 0,
    format: (value, format) => unit("%")(-value, format),
  });
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <Attribute name="speedFactor">Reduces target ship's velocity by {reduction.text}</Attribute>
    </>
  );
}
