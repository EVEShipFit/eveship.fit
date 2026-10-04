import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { useIconUrl } from "../../../primitives/Icon/Icon";
import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus, Line } from "./Attribute";
import type { LineProps } from "./index";

const meters = unit(" m");

export function Turret({ itemRef }: LineProps) {
  const optimal = useAttribute("maxRange", { of: itemRef }).value ?? 0;
  const falloff = useAttribute("falloff", { of: itemRef }).value ?? 0;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: unit(""),
  });
  const tracking = useAttribute("trackingSpeed", { of: itemRef, decimals: 2, fixed: true });

  return (
    <>
      <Attribute name="falloff">
        <span className={styles.block}>
          <span>Falloff range within {meters(optimal + falloff, { decimals: 0 })}</span>
          <span>Optimal range within {meters(optimal, { decimals: 0 })}</span>
        </span>
      </Attribute>
      <Line src={useIconUrl("stat-turret-dps")}>Damage Per Second {dps.text}</Line>
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
      Damage caused
      <span className={styles.bonuses}>
        {damages.map(({ name, value = 0 }) => (
          <Bonus key={name} name={name} text={unit(" HP")(value * multiplier, { decimals: 0 })} />
        ))}
      </span>
    </span>
  );
}

function useDamage(name: string, itemRef: ItemRef) {
  return { name, value: useAttribute(name, { of: itemRef, charge: true }).value };
}
