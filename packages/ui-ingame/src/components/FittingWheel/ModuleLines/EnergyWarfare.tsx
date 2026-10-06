import { ActivationRange } from "./ActivationRange";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";

export function EnergyNeutralizer(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="energyNeutralizerAmount" label="GJ neutralized" />
    </>
  );
}

export function EnergyNosferatu(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="powerTransferAmount" label="Points leeched" />
    </>
  );
}
