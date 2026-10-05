import type { LineProps } from "./index";
import { PerCycle } from "./PerCycle";

export function ShieldBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="shieldBonus" label="HP bonus" />;
}

export function ArmorRepairer({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="armorDamageAmount" label="HP repaired" />;
}

export function CapacitorBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="capacitorBonus" label="GJ" charge />;
}
