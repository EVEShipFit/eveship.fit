import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import type { LineProps } from "./index";

export function Cloak({ itemRef }: LineProps) {
  const modifier = useAttribute("maxVelocityModifier", {
    of: itemRef,
    decimals: 0,
    format: (value, format) => unit("%")((value - 1) * 100, format),
  });
  return (
    <Attribute name="maxVelocityModifier">
      {modifier.text} {useDisplayName("maxVelocityModifier")}
    </Attribute>
  );
}
