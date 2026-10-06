import { range } from "../../ShipStatistics/units";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { Range } from "./parts/Range";
import { Tracking } from "./parts/Tracking";
import type { LineProps } from "./index";

export function Turret({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloff" label="Optimal range" falloffLabel="Falloff range" format={range} />
      <DamagePerSecond itemRef={itemRef} icon="damageMultiplier" />
      <Damage itemRef={itemRef} />
      <Tracking itemRef={itemRef} />
    </>
  );
}

export function VortonProjector({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Optimal range" format={range} />
      <DamagePerSecond itemRef={itemRef} icon="damageMultiplier" />
      <Damage itemRef={itemRef} />
    </>
  );
}
