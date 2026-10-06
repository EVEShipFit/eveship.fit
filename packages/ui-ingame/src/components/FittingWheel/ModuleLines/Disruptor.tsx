import { ActivationRange } from "./ActivationRange";
import { BonusLine } from "./parts/Bonus";
import type { LineProps } from "./index";

/** Tracking, guidance and weapon disruptors. */
export function WeaponDisruptor(props: LineProps) {
  const { itemRef } = props;
  return (
    <>
      <ActivationRange {...props} />
      <BonusLine itemRef={itemRef} name="falloffBonus" />
      <BonusLine itemRef={itemRef} name="maxRangeBonus" />
      <BonusLine itemRef={itemRef} name="trackingSpeedBonus" />
      <BonusLine itemRef={itemRef} name="missileVelocityBonus" />
      <BonusLine itemRef={itemRef} name="explosionDelayBonus" />
      <BonusLine itemRef={itemRef} name="aoeVelocityBonus" />
      <BonusLine itemRef={itemRef} name="aoeCloudSizeBonus" />
    </>
  );
}
