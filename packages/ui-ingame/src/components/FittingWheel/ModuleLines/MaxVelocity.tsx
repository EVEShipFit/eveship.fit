import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import type { LineProps } from "./index";

export function MaxVelocity({ state }: LineProps) {
  const velocity = useAttribute("maxVelocity", { decimals: 2, fixed: true, grouping: false, format: unit(" m/s") });
  const running = state === "active" || state === "overload";
  return (
    <Attribute name="maxVelocity">
      Max Velocity {running ? "with" : "without"}: {velocity.text}
    </Attribute>
  );
}
