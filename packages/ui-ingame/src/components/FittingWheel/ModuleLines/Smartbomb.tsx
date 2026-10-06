import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { ActivationRange } from "./ActivationRange";
import { Attribute, AttributeLine, type Layout } from "./parts/Attribute";
import { Damage } from "./parts/Damage";
import type { LineProps } from "./index";

const hp = unit(" HP");
const dashed: Layout = (text, displayName) => `${text} - ${displayName}`;

export function Smartbomb({ itemRef }: LineProps) {
  const radius = useAttribute("empFieldRange", { of: itemRef, decimals: 0, format: range });
  return (
    <>
      <Attribute name="empFieldRange">Area of Effect Radius {radius.text}</Attribute>
      <DamageLines itemRef={itemRef} />
    </>
  );
}

export function PointDefense(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <Damage itemRef={props.itemRef} />
    </>
  );
}

export function Doomsday({ itemRef }: LineProps) {
  return <DamageLines itemRef={itemRef} />;
}

function DamageLines({ itemRef }: { itemRef: ItemRef }) {
  return ["emDamage", "thermalDamage", "kineticDamage", "explosiveDamage"].map((name) => (
    <AttributeLine key={name} itemRef={itemRef} name={name} decimals={0} format={hp} layout={dashed} hideZero />
  ));
}
