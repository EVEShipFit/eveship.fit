import { ActivationRange } from "./ActivationRange";
import { JammerStrengths } from "./parts/Bonus";
import type { LineProps } from "./index";

export function Ecm(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <JammerStrengths itemRef={props.itemRef} />
    </>
  );
}
