import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { ActivationRange } from "./ActivationRange";
import { Attribute } from "./parts/Attribute";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import { useHasEffect } from "./parts/effect";
import type { LineProps } from "./index";

export function Mining(props: LineProps) {
  const turret = useHasEffect(props.typeId, "turretFitted");
  const crystals = useAttribute("chargeGroup1", { of: props.itemRef }).value !== undefined;
  return (
    <>
      <MiningRange {...props} />
      {turret && crystals && <DamagePerSecond itemRef={props.itemRef} icon="damageMultiplier" />}
      <MiningAmount itemRef={props.itemRef} />
    </>
  );
}

export function MiningRange(props: LineProps) {
  const turret = useHasEffect(props.typeId, "turretFitted");
  return <ActivationRange {...props} label={turret ? "Optimal range" : "Range"} />;
}

/** Like "200 m³ per 60s (3.3 m³/s)". */
export function MiningAmount({ itemRef }: { itemRef: ItemRef }) {
  const amount = useAttribute("miningAmount", { of: itemRef, decimals: 0, grouping: false, format: unit(" m³") });
  const duration = useAttribute("duration", { of: itemRef, decimals: 1, format: unit("s", 1000) });
  const rate = useAttribute("miningAmount", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    format: (value, format) => unit(" m³/s")(value / ((duration.value ?? 0) / 1000), format),
  });
  return (
    <Attribute name="miningAmount">
      {amount.text} per {duration.text} ({rate.text})
    </Attribute>
  );
}
