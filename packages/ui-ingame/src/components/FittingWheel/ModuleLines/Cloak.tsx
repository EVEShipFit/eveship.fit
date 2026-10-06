import { AttributeLine } from "./parts/Attribute";
import { percent } from "./parts/Bonus";
import type { LineProps } from "./index";

export function Cloak({ itemRef }: LineProps) {
  return (
    <AttributeLine
      itemRef={itemRef}
      name="maxVelocityModifier"
      decimals={0}
      format={(value, format) => percent((value - 1) * 100, format)}
    />
  );
}
