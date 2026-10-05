import { useAttribute } from "@eveshipfit/react-hooks";

import { range } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function WarpScrambler({ itemRef }: LineProps) {
  const strength = useAttribute("warpScrambleStrength", { of: itemRef, decimals: 0 });
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <Attribute name="warpScrambleStrength">
        {useDisplayName("warpScrambleStrength")}: {strength.text}
      </Attribute>
    </>
  );
}

export function WarpDisruptionFieldGenerator({ itemRef }: LineProps) {
  return <Range itemRef={itemRef} optimal="warpScrambleRange" label="Range" format={range} />;
}
