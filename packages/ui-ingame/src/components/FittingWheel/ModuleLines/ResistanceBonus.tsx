import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useSde } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./parts/Attribute";
import type { LineProps } from "./index";

const percent = unit("%");

export function ResistanceBonus({ itemRef }: LineProps) {
  const sde = useSde();
  const bonuses = [
    useBonus("emDamageResistanceBonus", itemRef),
    useBonus("explosiveDamageResistanceBonus", itemRef),
    useBonus("kineticDamageResistanceBonus", itemRef),
    useBonus("thermalDamageResistanceBonus", itemRef),
  ].filter((bonus) => bonus.value);

  const [first] = bonuses;
  if (first === undefined) return null;
  if (bonuses.length === 1) {
    const { name, value } = first;
    const displayName = sde.attribute(sde.attributeId(name) ?? 0)?.displayName;
    return (
      <Attribute name={name}>
        {percent(value ?? 0, { decimals: 0 })} {displayName}
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

function useBonus(name: string, itemRef: ItemRef) {
  const { value, text } = useAttribute(name, { of: itemRef, decimals: 1, format: percent });
  return { name, value, text };
}
