import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useSde } from "@eveshipfit/react-hooks";

import { unit } from "../../../ShipStatistics/units";
import styles from "../../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./Attribute";

const hp = unit(" HP");

/** The damage of the loaded charge, per damage type; fully spooled up. */
export function Damage({ itemRef }: { itemRef: ItemRef }) {
  const sde = useSde();
  const spool = useAttribute("damageMultiplierBonusMax", { of: itemRef }).value ?? 0;
  const multiplier = (useAttribute("damageMultiplier", { of: itemRef }).value ?? 1) * (1 + spool);
  const damages = [
    useDamage("emDamage", itemRef),
    useDamage("thermalDamage", itemRef),
    useDamage("kineticDamage", itemRef),
    useDamage("explosiveDamage", itemRef),
  ]
    .filter((damage) => damage.value)
    .map(({ name, value = 0 }) => ({ name, text: hp(value * multiplier, { decimals: 0 }) }));

  const [first] = damages;
  if (first === undefined) return null;
  if (damages.length === 1) {
    const displayName = sde.attribute(sde.attributeId(first.name) ?? 0)?.displayName;
    return (
      <Attribute name={first.name}>
        {first.text} {displayName}
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

function useDamage(name: string, itemRef: ItemRef) {
  return { name, value: useAttribute(name, { of: itemRef, charge: true }).value };
}
