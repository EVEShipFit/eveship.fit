import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./parts/Attribute";
import type { LineProps } from "./index";

const percent = unit("%");

/** The resistances a module gives, per layer. */
export function Resistance({ itemRef }: LineProps) {
  const layers = [
    { label: "Shield", icon: "shieldCapacity", resistances: useResistances("shield", itemRef) },
    { label: "Armor", icon: "armorHP", resistances: useResistances("armor", itemRef) },
    { label: "Hull", icon: "hp", resistances: useResistances("hull", itemRef) },
  ].filter(({ resistances }) => resistances.some(({ value }) => value !== undefined && value !== 1));

  return layers.map((layer) => <Layer key={layer.label} {...layer} withIcon={layers.length > 1} />);
}

function Layer({
  label,
  icon,
  resistances,
  withIcon,
}: {
  label: string;
  icon: string;
  resistances: Value[];
  withIcon: boolean;
}) {
  const values = (
    <span className={styles.values}>
      {resistances.map(({ name, text }) => (
        <Bonus key={name} name={name} text={text} />
      ))}
    </span>
  );

  return (
    <span className={styles.block}>
      <span className={styles.iconless}>{label} damage resistance</span>
      {withIcon ? <Attribute name={icon}>{values}</Attribute> : values}
    </span>
  );
}

interface Value {
  name: string;
  value: number | undefined;
  text: string;
}

function useResistances(layer: string, itemRef: ItemRef): Value[] {
  return [
    useResistance(`${layer}EmDamageResonance`, itemRef),
    useResistance(`${layer}ExplosiveDamageResonance`, itemRef),
    useResistance(`${layer}KineticDamageResonance`, itemRef),
    useResistance(`${layer}ThermalDamageResonance`, itemRef),
  ];
}

function useResistance(name: string, itemRef: ItemRef): Value {
  const { value, text } = useAttribute(name, {
    of: itemRef,
    decimals: 1,
    fixed: true,
    format: (resonance, format) => percent((1 - resonance) * 100, format),
  });
  return { name, value, text };
}
