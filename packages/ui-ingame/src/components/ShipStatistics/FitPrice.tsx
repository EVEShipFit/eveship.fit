import type { FitPriceItem } from "@eveshipfit/fitting";
import { formatNumber, useType } from "@eveshipfit/react-hooks";

import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./ShipStatistics.module.css";

export interface FitPriceProps {
  /** In ISK; undefined while unknown. */
  price: number | undefined;
  change?: "better" | "worse";
  /** What `price` adds up, listed in its tooltip. */
  items?: readonly FitPriceItem[];
}

export function FitPrice({ price, change, items }: FitPriceProps) {
  return (
    <Tooltip label={price !== undefined && items !== undefined ? () => priceList(price, items) : undefined} wide>
      <div
        className={styles.price}
        data-change={change}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
        role="group"
        aria-label="Estimated Price"
      >
        {price !== undefined && (
          <>
            {formatMillions(price)}
            <Icon name="price" />
          </>
        )}
      </div>
    </Tooltip>
  );
}

function priceList(price: number, items: readonly FitPriceItem[]) {
  return (
    <span className={styles.priceList}>
      <span className={styles.priceTotal}>
        <span>Total Estimated Price:</span>
        <span>{formatMillions(price)}</span>
      </span>
      {items.map((item) => (
        <PriceRow key={item.typeId} item={item} />
      ))}
    </span>
  );
}

function PriceRow({ item }: { item: FitPriceItem }) {
  const type = useType(item.typeId);
  return (
    <span className={styles.priceItem}>
      <span className={styles.priceIcon}>
        <TypeIcon typeId={item.typeId} size={24} />
      </span>
      <span>{type?.name}</span>
      <span>{item.quantity}x</span>
      <span>{item.price === undefined ? "–" : formatIsk(item.price * item.quantity)}</span>
    </span>
  );
}

function formatIsk(isk: number): string {
  return isk < 1_000_000 ? `${formatNumber(isk, { decimals: 0 })} ISK` : formatMillions(isk);
}

function formatMillions(isk: number): string {
  return `${formatNumber(isk / 1_000_000, { decimals: 1, fixed: true })}M ISK`;
}
