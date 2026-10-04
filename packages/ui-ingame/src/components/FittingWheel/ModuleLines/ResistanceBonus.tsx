import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useImages, useSde } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute } from "./Attribute";
import type { LineProps } from "./index";

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
    const { name, text } = first;
    const displayName = sde.attribute(sde.attributeId(name) ?? 0)?.displayName;
    return (
      <Attribute name={name}>
        {text} {displayName}
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
  const { value, text } = useAttribute(name, { of: itemRef, decimals: 1, format: unit("%") });
  return { name, value, text };
}

function Bonus({ name, text }: { name: string; text: string }) {
  const sde = useSde();
  const images = useImages();
  const id = sde.attributeId(name);
  return (
    <span className={styles.bonus}>
      <img
        src={id === undefined ? undefined : images.attributeIcon(id)}
        width={24}
        height={24}
        alt=""
        draggable={false}
      />
      {text}
    </span>
  );
}
