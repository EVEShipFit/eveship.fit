import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../../ShipStatistics/units";
import styles from "../../ModuleTooltip.module.css";
import { Attribute, Bonus, useDisplayName } from "./Attribute";

const hp = unit(" HP");

/** The damage of the loaded charge, per damage type; fully spooled up. */
export function Damage({ itemRef }: { itemRef: ItemRef }) {
  const spool = useAttribute("damageMultiplierBonusMax", { of: itemRef }).value ?? 0;
  const multiplier = (useAttribute("damageMultiplier", { of: itemRef }).value ?? 1) * (1 + spool);
  return <DamageTypes itemRef={itemRef} charge multiplier={multiplier} />;
}

/** The damage of an item or its charge, per damage type. */
export function DamageTypes({
  itemRef,
  charge = false,
  multiplier = 1,
}: {
  itemRef: ItemRef;
  charge?: boolean;
  multiplier?: number;
}) {
  const damages = [
    useDamage("emDamage", itemRef, charge),
    useDamage("thermalDamage", itemRef, charge),
    useDamage("kineticDamage", itemRef, charge),
    useDamage("explosiveDamage", itemRef, charge),
  ]
    .filter((damage) => damage.value)
    .map(({ name, value = 0, displayName }) => ({ name, displayName, text: hp(value * multiplier, { decimals: 0 }) }));

  const [first] = damages;
  if (first === undefined) return null;
  if (damages.length === 1) {
    return (
      <Attribute name={first.name}>
        {first.text} {first.displayName}
      </Attribute>
    );
  }

  return (
    <>
      <span className={styles.iconless}>Damage caused</span>
      <span className={styles.values}>
        {damages.map(({ name, text }) => (
          <Bonus key={name} name={name} text={text} />
        ))}
      </span>
    </>
  );
}

function useDamage(name: string, itemRef: ItemRef, charge: boolean) {
  return { name, value: useAttribute(name, { of: itemRef, charge }).value, displayName: useDisplayName(name) };
}
