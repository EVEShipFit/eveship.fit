import { useAttribute, useSde, useType } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function Mining({ itemRef, typeId }: LineProps) {
  const sde = useSde();
  const type = useType(typeId);
  const turret = [...(type?.effectIds ?? [])].some((id) => sde.effect(id)?.name === "turretFitted");
  const crystals = useAttribute("chargeGroup1", { of: itemRef }).value !== undefined;
  const amount = useAttribute("miningAmount", { of: itemRef, decimals: 0, grouping: false, format: unit(" m³") });
  const duration = useAttribute("duration", { of: itemRef, decimals: 1, format: unit("s", 1000) });
  const rate = useAttribute("miningAmount", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    format: (value, format) => unit(" m³/s")(value / ((duration.value ?? 0) / 1000), format),
  });
  return (
    <>
      <Range itemRef={itemRef} label={turret ? "Optimal range" : "Range"} format={range} />
      {turret && crystals && <DamagePerSecond itemRef={itemRef} icon="damageMultiplier" />}
      <Attribute name="miningAmount">
        {amount.text} per {duration.text} ({rate.text})
      </Attribute>
    </>
  );
}
