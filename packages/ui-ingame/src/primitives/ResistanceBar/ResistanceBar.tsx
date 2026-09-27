import type { CSSProperties, ReactNode } from "react";

import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./ResistanceBar.module.css";

export type DamageType = "em" | "thermal" | "kinetic" | "explosive";

export interface ResistanceBarProps {
  damage: DamageType;
  label: string;
  /** From 0 to 1. */
  resistance: number;
  /** The resistance as text. */
  children: ReactNode;
}

export function ResistanceBar({ damage, label, resistance, children }: ResistanceBarProps) {
  return (
    <Tooltip label={label}>
      <div
        className={styles.bar}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <meter> cannot be styled the same in every browser.
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={resistance}
        data-damage={damage}
        style={{ "--resistance": resistance } as CSSProperties}
      >
        {children}
      </div>
    </Tooltip>
  );
}
