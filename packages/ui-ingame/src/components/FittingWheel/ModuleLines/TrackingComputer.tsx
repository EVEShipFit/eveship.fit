import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function RemoteTrackingComputer({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <BonusLine itemRef={itemRef} name="falloffBonus" />
      <BonusLine itemRef={itemRef} name="maxRangeBonus" />
      <BonusLine itemRef={itemRef} name="trackingSpeedBonus" />
    </>
  );
}

export function TrackingComputer({ itemRef }: LineProps) {
  return (
    <>
      <BonusLine itemRef={itemRef} name="falloffBonus" />
      <BonusLine itemRef={itemRef} name="maxRangeBonus" />
      <BonusLine itemRef={itemRef} name="trackingSpeedBonus" />
    </>
  );
}

function BonusLine({ itemRef, name }: { itemRef: ItemRef; name: string }) {
  const bonus = useAttribute(name, { of: itemRef, decimals: 0, fallback: 0, format: unit("%") });
  return (
    <Attribute name={name}>
      {useDisplayName(name)}: {bonus.text}
    </Attribute>
  );
}
