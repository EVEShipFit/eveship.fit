import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useSde, useType } from "@eveshipfit/react-hooks";

import { MiningAmount } from "../FittingWheel/ModuleLines/Mining";
import { Attribute } from "../FittingWheel/ModuleLines/parts/Attribute";
import { DamageTypes } from "../FittingWheel/ModuleLines/parts/Damage";
import { EffectRange } from "../FittingWheel/ModuleLines/parts/EffectRange";
import { Tracking } from "../FittingWheel/ModuleLines/parts/Tracking";
import { TypeRow } from "../FittingWheel/ModuleTooltip";
import styles from "../FittingWheel/ModuleTooltip.module.css";
import { damagePerSecond, unit } from "../ShipStatistics/units";

/** What EVE shows when hovering a drone in the drone bay. */
export function DroneTooltip({ itemRef, typeId }: { itemRef: ItemRef; typeId: number }) {
  const sde = useSde();
  const type = useType(typeId);
  const effectId = type?.defaultEffectId;
  const mining = sde.group(type?.groupId ?? 0)?.name === "Mining Drone";
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
      <DamageTypes itemRef={itemRef} />
      {mining && <MiningAmount itemRef={itemRef} />}
      <Tracking itemRef={itemRef} />
      <Attribute name="droneBandwidthUsed">Bandwidth Needed {bandwidth.text}</Attribute>
    </span>
  );
}
