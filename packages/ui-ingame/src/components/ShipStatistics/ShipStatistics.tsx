import { CapacitorStats } from "./CapacitorStats";
import { DefenseStats } from "./DefenseStats";
import { DroneStats } from "./DroneStats";
import { FitPrice } from "./FitPrice";
import { NavigationStats } from "./NavigationStats";
import { OffenseStats } from "./OffenseStats";
import styles from "./ShipStatistics.module.css";
import { TargetingStats } from "./TargetingStats";

export interface ShipStatisticsProps {
  label?: string;
}

/** EVE's statistics of the fit, as its fitting window shows them. */
export function ShipStatistics({ label = "Statistics" }: ShipStatisticsProps) {
  return (
    <section className={styles.statistics} aria-label={label}>
      <div className={styles.sections}>
        <CapacitorStats />
        <OffenseStats />
        <DefenseStats />
        <TargetingStats />
        <NavigationStats />
        <DroneStats />
      </div>
      <FitPrice price={0} />
    </section>
  );
}
