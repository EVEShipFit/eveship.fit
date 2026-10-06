import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { range } from "../../../ShipStatistics/units";
import styles from "../../ModuleTooltip.module.css";
import { Attribute } from "./Attribute";

/** Optimal range and optimal plus falloff; only the optimal range with a falloff of 1 m or less. */
export function Range({
  itemRef,
  optimal: optimalName,
  falloff,
  label,
  falloffLabel = label,
}: {
  itemRef: ItemRef;
  optimal: string;
  falloff?: string;
  label: string;
  falloffLabel?: string;
}) {
  const optimal = useAttribute(optimalName, { of: itemRef, decimals: 0, format: range });
  const total = useAttribute(falloff ?? optimalName, {
    of: itemRef,
    decimals: 0,
    format: (value, format) => range(value + (optimal.value ?? 0), format),
  });

  if (falloff === undefined || (total.value ?? 0) <= 1) {
    return (
      <Attribute name="maxRange">
        {label} within {optimal.text}
      </Attribute>
    );
  }

  return (
    <Attribute name="maxRange">
      <span className={styles.block}>
        <span>
          {falloffLabel} within {total.text}
        </span>
        <span>Optimal range within {optimal.text}</span>
      </span>
    </Attribute>
  );
}
