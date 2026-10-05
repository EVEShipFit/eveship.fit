import { range } from "../../ShipStatistics/units";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function ActivationRange({ itemRef }: LineProps) {
  return <Range itemRef={itemRef} label="Range" format={range} />;
}
