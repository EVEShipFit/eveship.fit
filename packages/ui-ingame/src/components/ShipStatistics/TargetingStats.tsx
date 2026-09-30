import { useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { AttributeTooltip } from "./AttributeTooltip";
import { sensorAttributes, strongestSensor } from "./sensors";
import { unit } from "./units";

const points = { decimals: 2, fixed: true, format: unit(" points") };

export function TargetingStats() {
  const range = useAttribute("maxTargetRange", { decimals: 2, fixed: true, format: unit(" km", 1000) });
  const sensors = {
    amarr: useAttribute(sensorAttributes.amarr, points),
    caldari: useAttribute(sensorAttributes.caldari, points),
    gallente: useAttribute(sensorAttributes.gallente, points),
    minmatar: useAttribute(sensorAttributes.minmatar, points),
  };
  const resolution = useAttribute("scanResolution", { decimals: 0, rounding: "down", format: unit(" mm") });
  const signature = useAttribute("signatureRadius", { decimals: 0, format: unit(" m") });
  const targets = useAttribute("maxTargets", { decimals: 0, rounding: "up", format: unit("x") });

  const race = strongestSensor(sensors);

  return (
    <StatsSection title="Targeting" summary={<AttributeText value={range} />} columns={2}>
      <Stat
        icon={`stat-sensor-${race}`}
        label="Sensor Strength"
        tooltip={<AttributeTooltip attribute={sensorAttributes[race]} />}
      >
        <AttributeText value={sensors[race]} />
      </Stat>
      <Stat
        icon="stat-scan-resolution"
        label="Scan Resolution"
        tooltip={<AttributeTooltip attribute="scanResolution" />}
      >
        <AttributeText value={resolution} />
      </Stat>
      <Stat
        icon="stat-signature-radius"
        label="Signature Radius"
        tooltip={<AttributeTooltip attribute="signatureRadius" />}
      >
        <AttributeText value={signature} />
      </Stat>
      <Stat
        icon="stat-locked-targets"
        label="Maximum Locked Targets"
        tooltip={<AttributeTooltip attribute="maxLockedTargets" />}
      >
        <AttributeText value={targets} />
      </Stat>
    </StatsSection>
  );
}
