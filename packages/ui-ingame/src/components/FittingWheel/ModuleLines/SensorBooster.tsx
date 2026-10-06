import { ActivationRange } from "./ActivationRange";
import { BonusLine, SensorStrengths, useBonus } from "./parts/Bonus";
import type { LineProps } from "./index";

export function SensorBooster(props: LineProps) {
  const { itemRef } = props;
  return (
    <>
      <ActivationRange {...props} />
      <BonusLine itemRef={itemRef} name="scanResolutionBonus" />
      <BonusLine itemRef={itemRef} name="maxTargetRangeBonus" />
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
