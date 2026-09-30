import { useFitPrice, useSnapshot } from "@eveshipfit/react-hooks";

import { CapacitorStats } from "./CapacitorStats";
import { DefenseStats } from "./DefenseStats";
import { DroneStats } from "./DroneStats";
import { FighterStats } from "./FighterStats";
import { FitPrice } from "./FitPrice";
import { FuelStats } from "./FuelStats";
import { NavigationStats } from "./NavigationStats";
import { OffenseStats } from "./OffenseStats";
import styles from "./ShipStatistics.module.css";
import { TargetingStats } from "./TargetingStats";

export interface ShipStatisticsProps {
  label?: string;
}

/** EVE's statistics of the fit, as its fitting window shows them. */
export function ShipStatistics({ label = "Statistics" }: ShipStatisticsProps) {
  const { stats } = useSnapshot();
  const price = useFitPrice();

  return (
    <section className={styles.statistics} aria-label={label}>
      <div className={styles.sections}>
        <CapacitorStats />
        <OffenseStats />
        <DefenseStats />
        <TargetingStats />
        {stats.structure ? (
          <>
            <FighterStats />
            <FuelStats />
          </>
        ) : (
          <>
            <NavigationStats />
            {stats.fighterBay.total > 0 ? <FighterStats /> : <DroneStats />}
          </>
        )}
      </div>
      <FitPrice price={price} />
    </section>
  );
}
