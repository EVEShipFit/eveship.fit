import type { ItemRef } from "@eveshipfit/fitting";

import { ActivationRange } from "./ActivationRange";
import { AttributeLine, nameFirst } from "./parts/Attribute";
import { percent } from "./parts/Bonus";
import type { LineProps } from "./index";

export function TrackingComputer(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <BonusLine itemRef={props.itemRef} name="falloffBonus" />
      <BonusLine itemRef={props.itemRef} name="maxRangeBonus" />
      <BonusLine itemRef={props.itemRef} name="trackingSpeedBonus" />
    </>
  );
}

function BonusLine({ itemRef, name }: { itemRef: ItemRef; name: string }) {
  return <AttributeLine itemRef={itemRef} name={name} decimals={0} fallback={0} format={percent} layout={nameFirst} />;
}
