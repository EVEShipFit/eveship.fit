import { useAttribute } from "@eveshipfit/react-hooks";

import { Stat } from "../../primitives/Stat/Stat";
import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { AttributeText } from "./AttributeText";
import styles from "./ShipStatistics.module.css";
import { unit } from "./units";

const hitpoints = { decimals: 0, format: unit(" hp") };

export function DefenseStats() {
  const ehp = useAttribute("ehp", { decimals: 0, format: unit(" ehp") });
  const shield = useAttribute("shieldCapacity", hitpoints);
  const shieldRecharge = useAttribute("shieldRechargeRate", { decimals: 0 });
  const armor = useAttribute("armorHP", hitpoints);
  const structure = useAttribute("hp", hitpoints);

  return (
    <StatsSection title="Defense" summary={<AttributeText value={ehp} />}>
      <Stat icon="stat-shield-hp" label="Shield Hitpoints / Recharge Time">
        <span className={styles.lines}>
          <AttributeText value={shield} />
          <AttributeText value={shieldRecharge} />
        </span>
      </Stat>
      <Stat icon="stat-armor-hp" label="Armor Hitpoints">
        <AttributeText value={armor} />
      </Stat>
      <Stat icon="stat-structure-hp" label="Structure Hitpoints">
        <AttributeText value={structure} />
      </Stat>
    </StatsSection>
  );
}
