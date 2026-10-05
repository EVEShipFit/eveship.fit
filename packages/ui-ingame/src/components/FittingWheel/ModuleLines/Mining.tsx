import { useAttribute, useSde, useShownSnapshot, useType } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function Mining({ itemRef }: LineProps) {
  const sde = useSde();
  const type = useType(useShownSnapshot().fit.items[itemRef]?.type_id);
  const turret = [...(type?.effectIds ?? [])].some((id) => sde.effect(id)?.name === "turretFitted");
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
      <Attribute name="miningAmount">
        {amount.text} per {duration.text} ({rate.text})
      </Attribute>
    </>
  );
}
