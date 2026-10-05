import { unit } from "../../ShipStatistics/units";
import type { LineProps } from "./index";
import { PerCycle } from "./PerCycle";
import { Range } from "./Range";

const kilometers = unit(" km", 1000);

export function EnergyNeutralizer({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={kilometers} />
      <PerCycle itemRef={itemRef} name="energyNeutralizerAmount" label="GJ neutralized" />
    </>
  );
}

export function EnergyNosferatu({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={kilometers} />
      <PerCycle itemRef={itemRef} name="powerTransferAmount" label="Points leeched" />
    </>
  );
}
