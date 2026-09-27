import { useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { unit } from "./units";

const dps = { decimals: 1, fixed: true, fallback: 0, format: unit(" dps") };

export function OffenseStats() {
  const withoutReload = useAttribute("damagePerSecondWithoutReload", dps);
  const withReload = useAttribute("damagePerSecondWithReload", dps);
  const alpha = useAttribute("damageAlpha", { decimals: 0, fallback: 0, format: unit(" HP") });

  return (
    <StatsSection title="Offense" summary={<AttributeText value={withoutReload} />} columns={2}>
      <Stat icon="stat-turret-dps" label="Damage per Second">
        <AttributeText value={withoutReload} />
        {withReload.text !== withoutReload.text && (
          <>
            {" "}
            (<AttributeText value={withReload} />)
          </>
        )}
      </Stat>
      <Stat icon="stat-alpha-strike" label="Alpha Strike">
        <AttributeText value={alpha} />
      </Stat>
    </StatsSection>
  );
}
