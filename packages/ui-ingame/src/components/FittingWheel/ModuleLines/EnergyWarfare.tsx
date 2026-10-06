import { range } from "../../ShipStatistics/units";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";
import { Range } from "./parts/Range";

export function EnergyNeutralizer({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <PerCycle itemRef={itemRef} name="energyNeutralizerAmount" label="GJ neutralized" />
    </>
  );
}

export function StructureEnergyNeutralizer({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <PerCycle itemRef={itemRef} name="energyNeutralizerAmount" label="GJ neutralized" />
    </>
  );
}

export function EnergyNosferatu({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <PerCycle itemRef={itemRef} name="powerTransferAmount" label="Points leeched" />
    </>
  );
}
