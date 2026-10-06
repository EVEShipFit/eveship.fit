import type { ItemRef } from "@eveshipfit/fitting";

import { range } from "../../ShipStatistics/units";
import { BonusLine, useBonus } from "./parts/Bonus";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function TrackingDisruptor({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <TrackingBonuses itemRef={itemRef} />
    </>
  );
}

export function GuidanceDisruptor({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <GuidanceBonuses itemRef={itemRef} />
    </>
  );
}

export function WeaponDisruptor({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <TrackingBonuses itemRef={itemRef} />
      <GuidanceBonuses itemRef={itemRef} />
    </>
  );
}

function TrackingBonuses({ itemRef }: { itemRef: ItemRef }) {
  return (
    <>
      <BonusLine bonus={useBonus("falloffBonus", itemRef)} />
      <BonusLine bonus={useBonus("maxRangeBonus", itemRef)} />
      <BonusLine bonus={useBonus("trackingSpeedBonus", itemRef)} />
    </>
  );
}

function GuidanceBonuses({ itemRef }: { itemRef: ItemRef }) {
  return (
    <>
      <BonusLine bonus={useBonus("missileVelocityBonus", itemRef)} />
      <BonusLine bonus={useBonus("explosionDelayBonus", itemRef)} />
      <BonusLine bonus={useBonus("aoeVelocityBonus", itemRef)} />
      <BonusLine bonus={useBonus("aoeCloudSizeBonus", itemRef)} />
    </>
  );
}
