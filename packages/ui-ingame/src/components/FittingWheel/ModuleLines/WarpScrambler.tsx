import { ActivationRange } from "./ActivationRange";
import { AttributeLine, nameFirst } from "./parts/Attribute";
import type { LineProps } from "./index";

export function WarpScrambler(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <AttributeLine itemRef={props.itemRef} name="warpScrambleStrength" decimals={0} layout={nameFirst} />
    </>
  );
}
