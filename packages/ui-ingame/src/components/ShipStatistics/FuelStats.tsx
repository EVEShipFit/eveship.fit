import { formatNumber, useSnapshot, useStats, type AttributeValue } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";

export function FuelStats() {
  const perDay = useStats().fuel * 24;
  const before = useSnapshot().stats.fuel * 24;
  const fuel: AttributeValue = {
    value: perDay,
    text: `${formatNumber(perDay, { decimals: 0 })} units/day`,
    change: perDay === before ? undefined : perDay < before ? "better" : "worse",
  };

  return (
    <StatsSection title="Fuel">
      <Stat icon="stat-fuel" label="Fuel Usage">
        <AttributeText value={fuel} />
      </Stat>
    </StatsSection>
  );
}
