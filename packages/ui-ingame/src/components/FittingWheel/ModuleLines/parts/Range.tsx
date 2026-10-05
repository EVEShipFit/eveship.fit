import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, type NumberFormat } from "@eveshipfit/react-hooks";

import styles from "../../ModuleTooltip.module.css";
import { Attribute } from "./Attribute";

/** Optimal range and optimal plus falloff; only the optimal range without `falloff`. */
export function Range({
  itemRef,
  falloff,
  label,
  format,
}: {
  itemRef: ItemRef;
  falloff?: string;
  label: string;
  format: (value: number, format: NumberFormat) => string;
}) {
  const optimal = useAttribute("maxRange", { of: itemRef, decimals: 0, format });
  const total = useAttribute(falloff ?? "maxRange", {
    of: itemRef,
    decimals: 0,
    format: (value, numberFormat) => format(value + (optimal.value ?? 0), numberFormat),
  });

  if (falloff === undefined) {
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
          {label} within {total.text}
        </span>
        <span>Optimal range within {optimal.text}</span>
      </span>
    </Attribute>
  );
}
