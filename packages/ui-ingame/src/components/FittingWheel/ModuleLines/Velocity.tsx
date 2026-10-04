import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute } from "./Attribute";
import type { LineProps } from "./index";

export function Velocity({ state }: LineProps) {
  const velocity = useAttribute("maxVelocity", { decimals: 2, fixed: true, grouping: false, format: unit(" m/s") });
  const running = state === "active" || state === "overload";
  return (
    <Attribute name="maxVelocity">
      Max Velocity {running ? "with" : "without"}: {velocity.text}
    </Attribute>
  );
}
