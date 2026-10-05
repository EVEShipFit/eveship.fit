import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";

export function CapacitorBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="capacitorBonus" label="GJ" charge />;
}
