import { AttributeLine, nameFirst } from "./parts/Attribute";
import { percent } from "./parts/Bonus";
import type { LineProps } from "./index";

export function CommandBonus({ itemRef }: LineProps) {
  return <AttributeLine itemRef={itemRef} name="commandBonus" decimals={2} fixed format={percent} layout={nameFirst} />;
}
