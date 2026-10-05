import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import type { LineProps } from "./index";

export function Smartbomb({ itemRef }: LineProps) {
  const radius = useAttribute("empFieldRange", { of: itemRef, decimals: 0, format: unit(" m") });
  return (
    <>
      <Attribute name="empFieldRange">Area of Effect Radius {radius.text}</Attribute>
      <DamageLine itemRef={itemRef} name="emDamage" />
      <DamageLine itemRef={itemRef} name="thermalDamage" />
      <DamageLine itemRef={itemRef} name="kineticDamage" />
      <DamageLine itemRef={itemRef} name="explosiveDamage" />
    </>
  );
}

function DamageLine({ itemRef, name }: Pick<LineProps, "itemRef"> & { name: string }) {
  const damage = useAttribute(name, { of: itemRef, decimals: 0, format: unit(" HP") });
  const displayName = useDisplayName(name);
  if (!damage.value) return null;
  return (
    <Attribute name={name}>
      {damage.text} - {displayName}
    </Attribute>
  );
}
