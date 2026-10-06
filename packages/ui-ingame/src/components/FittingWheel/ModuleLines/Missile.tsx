import styles from "../ModuleTooltip.module.css";
import { Attribute } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { useHasEffect } from "./parts/effect";
import { FlightRange, useFlightRange } from "./parts/flightRange";
import type { LineProps } from "./index";

export function Missile({ itemRef, typeId }: LineProps) {
  const flightRange = useFlightRange(itemRef);
  const launcher = useHasEffect(typeId, "launcherFitted");

  return (
    <>
      {launcher ? (
        flightRange !== undefined && (
          <Attribute name="maxRange">
            <span className={styles.block}>
              <span>Max flight range</span>
              <span>{flightRange}</span>
            </span>
          </Attribute>
        )
      ) : (
        <FlightRange itemRef={itemRef} />
      )}
      <DamagePerSecond itemRef={itemRef} icon="launcherHardPointModifier" />
      <Damage itemRef={itemRef} />
    </>
  );
}
