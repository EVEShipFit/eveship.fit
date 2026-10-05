import { useAttribute, useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties } from "react";

import { range } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import type { LineProps } from "./index";

export function Compressor({ itemRef }: LineProps) {
  const texture = useImages().uiTexture("eveicon/control_icons/show_info_16px");
  const maxRange = useAttribute("maxRange", { of: itemRef, decimals: 0, format: range });
  return (
    <span className={styles.line}>
      <span className={styles.info} style={{ "--texture": `url(${texture})` } as CSSProperties} />
      Ships in your fleet have to be within {maxRange.text} to use compression.
    </span>
  );
}
