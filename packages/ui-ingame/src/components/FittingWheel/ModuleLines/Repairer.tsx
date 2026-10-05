import { useAttribute } from "@eveshipfit/react-hooks";

import { range } from "../../ShipStatistics/units";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";
import { Range } from "./parts/Range";

export function ShieldBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="shieldBonus" label="HP bonus" />;
}

export function RemoteShieldBooster({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <PerCycle itemRef={itemRef} name="shieldBonus" label="HP transported" />
    </>
  );
}

export function AncillaryRemoteShieldBooster({ itemRef }: LineProps) {
  return <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />;
}

export function ArmorRepairer({ itemRef }: LineProps) {
  const multiplier = useAttribute("chargedRepairMultiplier", { of: itemRef }).value;
  return <PerCycle itemRef={itemRef} name="armorDamageAmount" label="HP repaired" multiplier={multiplier} />;
}

export function RemoteArmorRepairer(props: LineProps) {
  return (
    <>
      <Range itemRef={props.itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <ArmorRepairer {...props} />
    </>
  );
}

export function AncillaryRemoteArmorRepairer(props: LineProps) {
  return (
    <>
      <Range itemRef={props.itemRef} label="Range" format={range} />
      <ArmorRepairer {...props} />
    </>
  );
}

export function HullRepairer({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="structureDamageAmount" label="HP" />;
}

export function RemoteHullRepairer(props: LineProps) {
  return (
    <>
      <Range itemRef={props.itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <HullRepairer {...props} />
    </>
  );
}
