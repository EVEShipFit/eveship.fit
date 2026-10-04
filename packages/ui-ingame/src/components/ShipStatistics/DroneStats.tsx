import { useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { AttributeTooltip } from "./AttributeTooltip";
import styles from "./ShipStatistics.module.css";
import { unit } from "./units";

export function DroneStats() {
  const dps = useAttribute("droneDamagePerSecond", { decimals: 1, fixed: true, fallback: 0, format: unit(" dps") });
  const bandwidthUsed = useAttribute("droneBandwidthLoad", { decimals: 1, fallback: 0, format: unit("") });
  const bandwidth = useAttribute("droneBandwidth", { decimals: 1, format: unit(" Mbit/sec") });
  const controlRange = useAttribute("droneControlDistance", {
    of: "character",
    decimals: 2,
    fixed: true,
    format: unit(" km", 1000),
  });
  const over = (bandwidthUsed.value ?? 0) > (bandwidth.value ?? 0);
  const active = useAttribute("droneActive", { decimals: 0, fallback: 0, format: unit(" Active") });

  return (
    <StatsSection title="Drones" summary={<AttributeText value={dps} />} columns={2}>
      <Stat
        icon="stat-drone-bandwidth"
        label="Drone Bandwidth"
        tooltip={<AttributeTooltip attribute="droneBandwidth" />}
      >
        <span className={styles.limit} data-over={over || undefined}>
          <AttributeText value={bandwidthUsed} />/<AttributeText value={bandwidth} />
        </span>
      </Stat>
      <Stat icon="stat-drone-control-range" label="Drone Control Range">
        <AttributeText value={controlRange} />
      </Stat>
      <Stat label="Active Drones">
        <AttributeText value={active} />
      </Stat>
    </StatsSection>
  );
}
