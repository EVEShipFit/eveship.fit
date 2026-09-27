import { useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { unit } from "./units";

export function NavigationStats() {
  const velocity = useAttribute("maxVelocity", { decimals: 1, fixed: true, format: unit(" m/s") });
  const mass = useAttribute("mass", { decimals: 2, fixed: true, format: unit(" t", 1000) });
  const inertia = useAttribute("agility", { decimals: 4, fixed: true, format: unit("x") });
  const warpSpeed = useAttribute("warpSpeedMultiplier", { decimals: 2, fixed: true, format: unit(" AU/s") });
  const alignTime = useAttribute("alignTime", { decimals: 2, fixed: true, format: unit("s") });

  return (
    <StatsSection title="Navigation" summary={<AttributeText value={velocity} />} columns={2}>
      <Stat icon="stat-mass" label="Mass">
        <AttributeText value={mass} />
      </Stat>
      <Stat icon="stat-inertia" label="Inertia Modifier">
        <AttributeText value={inertia} />
      </Stat>
      <Stat icon="stat-warp-speed" label="Warp Speed">
        <AttributeText value={warpSpeed} />
      </Stat>
      <Stat icon="stat-align-time" label="Align Time">
        <AttributeText value={alignTime} />
      </Stat>
    </StatsSection>
  );
}
