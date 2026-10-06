import styles from "../ModuleTooltip.module.css";
import { Attribute } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { useHasEffect } from "./parts/effect";
import { useFlightRange } from "./parts/flightRange";
import type { LineProps } from "./index";

export function Missile({ itemRef, typeId }: LineProps) {
  const flightRange = useFlightRange(itemRef);
  const launcher = useHasEffect(typeId, "launcherFitted");

  return (
    <>
      {flightRange !== undefined &&
        (launcher ? (
          <Attribute name="maxRange">
            <span className={styles.block}>
              <span>Max flight range</span>
              <span>{flightRange}</span>
            </span>
          </Attribute>
        ) : (
          <Attribute name="maxRange">Range within {flightRange}</Attribute>
        ))}
      <DamagePerSecond itemRef={itemRef} icon="launcherHardPointModifier" />
      <Damage itemRef={itemRef} />
    </>
  );
}
