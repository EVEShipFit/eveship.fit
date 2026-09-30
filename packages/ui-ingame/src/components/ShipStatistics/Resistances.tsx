import { useAttribute } from "@eveshipfit/react-hooks";

import { ResistanceBar, type DamageType } from "../../primitives/ResistanceBar/ResistanceBar";
import { AttributeText } from "./AttributeText";

export type Layer = "shield" | "armor" | "structure";

const resonances: Record<Layer, Record<DamageType, string>> = {
  shield: {
    em: "shieldEmDamageResonance",
    thermal: "shieldThermalDamageResonance",
    kinetic: "shieldKineticDamageResonance",
    explosive: "shieldExplosiveDamageResonance",
  },
  armor: {
    em: "armorEmDamageResonance",
    thermal: "armorThermalDamageResonance",
    kinetic: "armorKineticDamageResonance",
    explosive: "armorExplosiveDamageResonance",
  },
  structure: {
    em: "emDamageResonance",
    thermal: "thermalDamageResonance",
    kinetic: "kineticDamageResonance",
    explosive: "explosiveDamageResonance",
  },
};

const layerNames: Record<Layer, string> = { shield: "Shield", armor: "Armor", structure: "Structure" };
const damageNames: Record<DamageType, string> = {
  em: "EM",
  thermal: "Thermal",
  kinetic: "Kinetic",
  explosive: "Explosive",
};

export const damageTypes = Object.keys(damageNames) as DamageType[];

/** The four resistances of one layer. */
export function Resistances({ layer }: { layer: Layer }) {
  return damageTypes.map((damage) => <Resistance key={damage} layer={layer} damage={damage} />);
}

function Resistance({ layer, damage }: { layer: Layer; damage: DamageType }) {
  const resonance = useAttribute(resonances[layer][damage], { decimals: 0, rounding: "up" });

  return (
    <ResistanceBar
      damage={damage}
      label={`${layerNames[layer]} ${damageNames[damage]} Resistance`}
      resistance={1 - (resonance.value ?? 1)}
    >
      <AttributeText value={resonance} />
    </ResistanceBar>
  );
}
