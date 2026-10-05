import { useAttribute } from "@eveshipfit/react-hooks";

import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";

export function ShieldBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="shieldBonus" label="HP bonus" />;
}

export function ArmorRepairer({ itemRef }: LineProps) {
  const multiplier = useAttribute("chargedRepairMultiplier", { of: itemRef }).value;
  return <PerCycle itemRef={itemRef} name="armorDamageAmount" label="HP repaired" multiplier={multiplier} />;
}
