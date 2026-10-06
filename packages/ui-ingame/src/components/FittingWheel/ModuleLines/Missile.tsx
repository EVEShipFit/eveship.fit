import styles from "../ModuleTooltip.module.css";
import { Attribute } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { useFlightRange } from "./parts/flightRange";
import type { LineProps } from "./index";

export function Missile({ itemRef }: LineProps) {
  const flightRange = useFlightRange(itemRef);

  return (
    <>
      {flightRange !== undefined && (
        <Attribute name="maxRange">
          <span className={styles.block}>
            <span>Max flight range</span>
            <span>{flightRange}</span>
          </span>
        </Attribute>
      )}
      <DamagePerSecond itemRef={itemRef} icon="launcherHardPointModifier" />
      <Damage itemRef={itemRef} />
    </>
  );
}

export function Launcher({ itemRef }: LineProps) {
  const flightRange = useFlightRange(itemRef);

  return (
    <>
      {flightRange !== undefined && <Attribute name="maxRange">Range within {flightRange}</Attribute>}
      <DamagePerSecond itemRef={itemRef} icon="launcherHardPointModifier" />
      <Damage itemRef={itemRef} />
    </>
  );
}
