import { range } from "../../ShipStatistics/units";
import { BonusLine, SensorStrengths, useBonus } from "./parts/Bonus";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function RemoteSensorBooster(props: LineProps) {
  return (
    <>
      <Range itemRef={props.itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <SensorBooster {...props} />
    </>
  );
}

export function SensorBooster({ itemRef }: LineProps) {
  return (
    <>
      <BonusLine bonus={useBonus("scanResolutionBonus", itemRef)} />
      <BonusLine bonus={useBonus("maxTargetRangeBonus", itemRef)} />
      <SensorStrengths
        strengths={[
          useBonus("scanGravimetricStrengthPercent", itemRef),
          useBonus("scanLadarStrengthPercent", itemRef),
          useBonus("scanMagnetometricStrengthPercent", itemRef),
          useBonus("scanRadarStrengthPercent", itemRef),
        ]}
      />
    </>
  );
}
