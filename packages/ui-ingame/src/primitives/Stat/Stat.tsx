import type { ReactNode } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Stat.module.css";

export interface StatProps {
  /** Without one, the value still lines up with those that have one. */
  icon?: IconName;
  label: string;
  children: ReactNode;
}

/** One line of EVE's fitting statistics: an icon, and a value that names itself on hover. */
export function Stat({ icon, label, children }: StatProps) {
  return (
    <Tooltip label={label}>
      <div
        className={styles.stat}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
        role="group"
        aria-label={label}
      >
        {icon ? <Icon name={icon} /> : <span className={styles.noIcon} />}
        <span className={styles.value}>{children}</span>
      </div>
    </Tooltip>
  );
}
