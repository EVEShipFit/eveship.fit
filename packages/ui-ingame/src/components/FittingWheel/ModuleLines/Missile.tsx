import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute } from "./Attribute";
import { Damage } from "./Damage";
import type { LineProps } from "./index";

const kilometers = unit(" km", 1000);

export function Missile({ itemRef }: LineProps) {
  const velocity = useAttribute("maxVelocity", { of: itemRef, charge: true }).value;
  const flightTime = useAttribute("explosionDelay", { of: itemRef, charge: true }).value;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: formatNumber,
  });

  return (
    <>
      {velocity !== undefined && flightTime !== undefined && (
        <Attribute name="maxRange">
          <span className={styles.block}>
            <span>Max flight range</span>
            <span>{kilometers((velocity * flightTime) / 1000, { decimals: 0 })}</span>
          </span>
        </Attribute>
      )}
      <Attribute name="launcherSlotsLeft">Damage Per Second {dps.text}</Attribute>
      <Damage itemRef={itemRef} />
    </>
  );
}
