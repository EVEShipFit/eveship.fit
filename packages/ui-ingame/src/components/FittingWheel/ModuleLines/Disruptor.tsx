import { range } from "../../ShipStatistics/units";
import { BonusLine, useBonus } from "./parts/Bonus";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function TrackingDisruptor({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <BonusLine bonus={useBonus("falloffBonus", itemRef)} />
      <BonusLine bonus={useBonus("maxRangeBonus", itemRef)} />
      <BonusLine bonus={useBonus("trackingSpeedBonus", itemRef)} />
    </>
  );
}

export function GuidanceDisruptor({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <BonusLine bonus={useBonus("missileVelocityBonus", itemRef)} />
      <BonusLine bonus={useBonus("explosionDelayBonus", itemRef)} />
      <BonusLine bonus={useBonus("aoeVelocityBonus", itemRef)} />
      <BonusLine bonus={useBonus("aoeCloudSizeBonus", itemRef)} />
    </>
  );
}
