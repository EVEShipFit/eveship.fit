import type { ItemRef } from "@eveshipfit/fitting";
import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./Attribute";
import type { LineProps } from "./index";

const meters = unit(" m");
const hp = unit(" HP");

export function Turret({ itemRef }: LineProps) {
  const optimal = useAttribute("maxRange", { of: itemRef, decimals: 0, format: meters });
  const falloff = useAttribute("falloff", {
    of: itemRef,
    decimals: 0,
    format: (value, format) => meters(value + (optimal.value ?? 0), format),
  });
  const spool = useAttribute("damageMultiplierBonusMax", { of: itemRef }).value;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: (value, format) =>
      spool
        ? `${formatNumber(value / (1 + spool), format)}-${formatNumber(value, format)}`
        : formatNumber(value, format),
  });
  const tracking = useAttribute("trackingSpeed", { of: itemRef, decimals: 2, fixed: true });

  return (
    <>
      <Attribute name="maxRange">
        <span className={styles.block}>
          <span>Falloff range within {falloff.text}</span>
          <span>Optimal range within {optimal.text}</span>
        </span>
      </Attribute>
      <Attribute name="damageMultiplier">Damage Per Second {dps.text}</Attribute>
      <DamageCaused itemRef={itemRef} />
      <Attribute name="trackingSpeed">Turret Tracking: {tracking.text}</Attribute>
    </>
  );
}

function DamageCaused({ itemRef }: { itemRef: ItemRef }) {
  const multiplier = useAttribute("damageMultiplier", { of: itemRef }).value ?? 1;
  const damages = [
    useDamage("emDamage", itemRef),
    useDamage("thermalDamage", itemRef),
    useDamage("kineticDamage", itemRef),
    useDamage("explosiveDamage", itemRef),
  ].filter((damage) => damage.value);
  if (damages.length === 0) return null;

  return (
    <span className={styles.block}>
      <span className={styles.iconless}>Damage caused</span>
      <span className={styles.bonuses}>
        {damages.map(({ name, value = 0 }) => (
          <Bonus key={name} name={name} text={hp(value * multiplier, { decimals: 0 })} />
        ))}
      </span>
    </span>
  );
}

function useDamage(name: string, itemRef: ItemRef) {
  return { name, value: useAttribute(name, { of: itemRef, charge: true }).value };
}
