import type { AttributeValue } from "@eveshipfit/react-hooks";

import styles from "./ShipStatistics.module.css";

export function AttributeText({ value }: { value: AttributeValue }) {
  return (
    <span className={styles.attribute} data-change={value.change} data-boosted={value.boosted || undefined}>
      {value.text}
    </span>
  );
}
