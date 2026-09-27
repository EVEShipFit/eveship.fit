import { formatClock, formatDuration, useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { AttributeTooltip } from "./AttributeTooltip";
import styles from "./ShipStatistics.module.css";
import { unit } from "./units";

export function CapacitorStats() {
  // Negative while the capacitor is stable.
  const depletesIn = useAttribute("capacitorDepletesIn", {
    format: (value, { rounding }) => formatClock(value, rounding),
  });
  const capacity = useAttribute("capacitorCapacity", {
    decimals: 1,
    fixed: true,
    grouping: false,
    format: unit(" GJ"),
  });
  const rechargeTime = useAttribute("rechargeRate", {
    format: (value, { rounding }) => formatDuration(value / 1000, rounding),
  });
  const delta = useAttribute("capacitorPeakDelta", { decimals: 1, fixed: true, format: unit(" GJ/s") });
  const deltaPercentage = useAttribute("capacitorPeakDeltaPercentage", { decimals: 1, fixed: true, format: unit("%") });

  const stable = (depletesIn.value ?? -1) < 0;

  return (
    <StatsSection
      title="Capacitor"
      summary={
        stable ? (
          <span className={styles.good}>Stable</span>
        ) : (
          <span className={styles.bad}>Depletes in {depletesIn.text}</span>
        )
      }
    >
      <Stat
        label="Capacity / Recharge Time"
        tooltip={
          <>
            <AttributeTooltip attribute="capacitorCapacity" />
            <AttributeTooltip attribute="rechargeRate" />
          </>
        }
      >
        <AttributeText value={capacity} /> / <AttributeText value={rechargeTime} />
      </Stat>
      <Stat label="Peak Recharge Minus Usage">
        Δ <AttributeText value={delta} /> (<AttributeText value={deltaPercentage} />)
      </Stat>
    </StatsSection>
  );
}
