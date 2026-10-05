import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, Bonus } from "./Attribute";
import type { LineProps } from "./index";

const percent = unit("%");

/** The resistances a module gives, per layer. */
export function Resistance({ itemRef }: LineProps) {
  const layers = [
    { label: "Shield", icon: "shieldCapacity", resistances: useResistances("shield", itemRef) },
    { label: "Armor", icon: "armorHP", resistances: useResistances("armor", itemRef) },
    { label: "Hull", icon: "hp", resistances: useResistances("hull", itemRef) },
  ].filter(({ resistances }) => resistances.some(({ value }) => value !== undefined && value !== 1));

  const [first] = layers;
  if (first === undefined) return null;
  if (layers.length === 1) return <Layer {...first} />;

  return layers.map((layer) => (
    <Attribute key={layer.label} name={layer.icon}>
      <Layer {...layer} />
    </Attribute>
  ));
}

function Layer({ label, resistances }: { label: string; resistances: Resistance[] }) {
  return (
    <span className={styles.block}>
      {label} damage resistance
      <span className={styles.bonuses}>
        {resistances.map(({ name, text }) => (
          <Bonus key={name} name={name} text={text} />
        ))}
      </span>
    </span>
  );
}

interface Resistance {
  name: string;
  value: number | undefined;
  text: string;
}

function useResistances(layer: string, itemRef: ItemRef): Resistance[] {
  return [
    useResistance(`${layer}EmDamageResonance`, itemRef),
    useResistance(`${layer}ExplosiveDamageResonance`, itemRef),
    useResistance(`${layer}KineticDamageResonance`, itemRef),
    useResistance(`${layer}ThermalDamageResonance`, itemRef),
  ];
}

function useResistance(name: string, itemRef: ItemRef): Resistance {
  const { value, text } = useAttribute(name, {
    of: itemRef,
    decimals: 1,
    fixed: true,
    format: (resonance, format) => percent((1 - resonance) * 100, format),
  });
  return { name, value, text };
}
