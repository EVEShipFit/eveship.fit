import type { ReactNode } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Stat.module.css";

export interface StatProps {
  /** Without one, the value still lines up with those that have one; `null` leaves that space out. */
  icon?: IconName | null;
  label: string;
  /** `label` when left out. */
  tooltip?: ReactNode;
  children: ReactNode;
}

export function Stat({ icon, label, tooltip = label, children }: StatProps) {
  return (
    <Tooltip label={tooltip}>
      <div
        className={styles.stat}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
        role="group"
        aria-label={label}
      >
        {icon ? <Icon name={icon} /> : icon === undefined && <span className={styles.noIcon} />}
        <span className={styles.value}>{children}</span>
      </div>
    </Tooltip>
  );
}
