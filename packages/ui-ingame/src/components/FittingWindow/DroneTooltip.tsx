import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useType } from "@eveshipfit/react-hooks";

import { Attribute } from "../FittingWheel/ModuleLines/parts/Attribute";
import { EffectRange } from "../FittingWheel/ModuleLines/parts/EffectRange";
import { TypeRow } from "../FittingWheel/ModuleTooltip";
import styles from "../FittingWheel/ModuleTooltip.module.css";
import { damagePerSecond, unit } from "../ShipStatistics/units";

/** What EVE shows when hovering a drone in the drone bay. */
export function DroneTooltip({ itemRef, typeId }: { itemRef: ItemRef; typeId: number }) {
  const effectId = useType(typeId)?.defaultEffectId;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: damagePerSecond,
  });
  const bandwidth = useAttribute("droneBandwidthUsed", { of: itemRef, decimals: 1, format: unit(" Mbit/sec") });

  return (
    <span className={styles.tooltip}>
      <TypeRow typeId={typeId} />
      {effectId !== undefined && <EffectRange itemRef={itemRef} effectId={effectId} label="Range" />}
      <Attribute name="damageMultiplier">Damage Per Second {dps.text}</Attribute>
      <Attribute name="droneBandwidthUsed">Bandwidth Needed {bandwidth.text}</Attribute>
    </span>
  );
}
