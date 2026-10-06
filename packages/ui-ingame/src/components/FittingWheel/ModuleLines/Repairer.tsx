import { ActivationRange } from "./ActivationRange";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";

export function ShieldBooster({ itemRef }: LineProps) {
  return <PerCycle itemRef={itemRef} name="shieldBonus" label="HP bonus" />;
}

export function RemoteShieldBooster(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="shieldBonus" label="HP transported" />
    </>
  );
}

export function ArmorRepairer(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="armorDamageAmount" label="HP repaired" />
    </>
  );
}

export function HullRepairer(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="structureDamageAmount" label="HP" />
    </>
  );
}
