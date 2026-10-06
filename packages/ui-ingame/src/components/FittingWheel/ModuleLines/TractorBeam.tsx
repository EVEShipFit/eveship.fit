import { unit } from "../../ShipStatistics/units";
import { ActivationRange } from "./ActivationRange";
import { AttributeLine } from "./parts/Attribute";
import type { LineProps } from "./index";

export function TractorBeam(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <AttributeLine itemRef={props.itemRef} name="maxTractorVelocity" decimals={0} format={unit(" m/s")} />
    </>
  );
}
