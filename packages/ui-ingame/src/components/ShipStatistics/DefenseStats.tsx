import { useAttribute, useDamageProfiles, useStats } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import { AttributeTooltip } from "./AttributeTooltip";
import { DamageIcons, DamageProfilePicker, DamageShares } from "./DamageProfilePicker";
import { RepairRate } from "./RepairRate";
import { Resistances } from "./Resistances";
import styles from "./ShipStatistics.module.css";
import { hitpoints, unit } from "./units";

export function DefenseStats() {
  const ehp = useAttribute("ehp", { decimals: 0, rounding: "down", format: unit(" ehp") });
  const shield = useAttribute("shieldCapacity", { decimals: 0, rounding: "down", format: hitpoints });
  const shieldRecharge = useAttribute("shieldRechargeRate", { decimals: 0, rounding: "down" });
  const armor = useAttribute("armorHP", { decimals: 0, rounding: "down", format: hitpoints });
  const structure = useAttribute("hp", { decimals: 0, rounding: "down", format: hitpoints });
  const recharges = !useStats().structure;
  const { profile } = useDamageProfiles();

  return (
    <StatsSection title="Defense" summary={<AttributeText value={ehp} />} action={<DamageProfilePicker />}>
      <div className={styles.defense}>
        <RepairRate />
        <DamageIcons profile={profile} />
        <span />
        <DamageShares profile={profile} />
        <Stat
          icon="stat-shield-hp"
          label={recharges ? "Shield Hitpoints / Recharge Time" : "Shield Hitpoints"}
          tooltip={
            <>
              <AttributeTooltip attribute="shieldCapacity" />
              {recharges && <AttributeTooltip attribute="shieldRechargeRate" />}
            </>
          }
        >
          <span className={styles.lines}>
            <AttributeText value={shield} />
            {recharges && <AttributeText value={shieldRecharge} />}
          </span>
        </Stat>
        <Resistances layer="shield" />
        <Stat icon="stat-armor-hp" label="Armor Hitpoints" tooltip={<AttributeTooltip attribute="armorHP" />}>
          <AttributeText value={armor} />
        </Stat>
        <Resistances layer="armor" />
        <Stat icon="stat-structure-hp" label="Structure Hitpoints" tooltip={<AttributeTooltip attribute="hp" />}>
          <AttributeText value={structure} />
        </Stat>
        <Resistances layer="structure" />
      </div>
    </StatsSection>
  );
}
