import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useImages, useSde } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import type { LineProps } from "./index";

const bonuses = [
  "emDamageResistanceBonus",
  "explosiveDamageResistanceBonus",
  "kineticDamageResistanceBonus",
  "thermalDamageResistanceBonus",
];

export function ResistanceBonus({ itemRef }: LineProps) {
  return (
    <span className={styles.block}>
      Resistance Bonus:
      <span className={styles.bonuses}>
        {bonuses.map((name) => (
          <Bonus key={name} name={name} itemRef={itemRef} />
        ))}
      </span>
    </span>
  );
}

function Bonus({ name, itemRef }: { name: string; itemRef: ItemRef }) {
  const sde = useSde();
  const images = useImages();
  const bonus = useAttribute(name, { of: itemRef, decimals: 1, format: unit("%") });
  const id = sde.attributeId(name);
  if (!bonus.value) return null;
  return (
    <span className={styles.bonus}>
      <img
        src={id === undefined ? undefined : images.attributeIcon(id)}
        width={24}
        height={24}
        alt=""
        draggable={false}
      />
      {bonus.text}
    </span>
  );
}
