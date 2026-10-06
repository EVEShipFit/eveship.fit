import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./parts/Attribute";
import { percent, useBonus } from "./parts/Bonus";
import type { LineProps } from "./index";

export function ResistanceBonus({ itemRef }: LineProps) {
  const options = { decimals: 1 };
  const bonuses = [
    useBonus("emDamageResistanceBonus", itemRef, options),
    useBonus("explosiveDamageResistanceBonus", itemRef, options),
    useBonus("kineticDamageResistanceBonus", itemRef, options),
    useBonus("thermalDamageResistanceBonus", itemRef, options),
  ].filter((bonus) => bonus.value);

  const [first] = bonuses;
  if (first === undefined) return null;
  if (bonuses.length === 1) {
    return (
      <Attribute name={first.name}>
        {percent(first.value ?? 0, { decimals: 0 })} {first.displayName}
      </Attribute>
    );
  }

  return (
    <span className={styles.block}>
      Resistance Bonus:
      <span className={styles.bonuses}>
        {bonuses.map(({ name, text }) => (
          <Bonus key={name} name={name} text={text} />
        ))}
      </span>
    </span>
  );
}
