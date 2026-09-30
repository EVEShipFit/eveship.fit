import { formatNumber } from "@eveshipfit/react-hooks";

import { Icon } from "../../primitives/Icon/Icon";
import styles from "./ShipStatistics.module.css";

export interface FitPriceProps {
  /** In ISK; undefined while unknown. */
  price: number | undefined;
}

export function FitPrice({ price }: FitPriceProps) {
  return (
    <div
      className={styles.price}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
      role="group"
      aria-label="Estimated Price"
    >
      {price !== undefined && (
        <>
          {formatNumber(price / 1_000_000, { decimals: 1, fixed: true })}M ISK
          <Icon name="price" />
        </>
      )}
    </div>
  );
}
