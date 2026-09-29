import { baseValue } from "@eveshipfit/fitting";
import { useSde, useShownSnapshot } from "@eveshipfit/react-hooks";

import { StatsSection } from "../../primitives/StatsSection/StatsSection";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import styles from "./ShipStatistics.module.css";

export function FighterStats() {
  const sde = useSde();
  const { fit } = useShownSnapshot();

  let full = 0;
  let partial = 0;
  for (const item of fit.items) {
    const type = item.slot.type === "fighter_tube" ? sde.type(item.type_id) : undefined;
    if (type === undefined) continue;
    if ((item.quantity ?? 1) >= (baseValue(sde, type, "fighterSquadronMaxSize") ?? 1)) full += 1;
    else partial += 1;
  }

  return (
    <StatsSection title="Fighters">
      <div className={styles.fighters}>
        <span className={styles.lines}>
          <span>{full} Full Squadrons</span>
          <span>{partial} Partial Squadrons</span>
        </span>
        <Tooltip label="Manage (not implemented yet)">
          <button type="button" className={styles.manage} aria-disabled>
            Manage
          </button>
        </Tooltip>
      </div>
    </StatsSection>
  );
}
