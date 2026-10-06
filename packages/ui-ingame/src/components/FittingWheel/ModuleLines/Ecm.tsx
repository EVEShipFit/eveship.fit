import { range } from "../../ShipStatistics/units";
import { JammerStrengths } from "./parts/Bonus";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function Ecm({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <JammerStrengths itemRef={itemRef} />
    </>
  );
}

export function StructureEcm({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <JammerStrengths itemRef={itemRef} />
    </>
  );
}

export function BurstJammer({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} optimal="ecmBurstRange" label="Range" format={range} />
      <JammerStrengths itemRef={itemRef} />
    </>
  );
}
