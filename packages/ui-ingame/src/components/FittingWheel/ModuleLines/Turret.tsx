import { ActivationRange } from "./ActivationRange";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { Tracking } from "./parts/Tracking";
import type { LineProps } from "./index";

/** Turrets and vorton projectors. */
export function Turret(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} label="Optimal range" falloffLabel="Falloff range" />
      <DamagePerSecond itemRef={props.itemRef} icon="damageMultiplier" />
      <Damage itemRef={props.itemRef} />
      <Tracking itemRef={props.itemRef} />
    </>
  );
}
