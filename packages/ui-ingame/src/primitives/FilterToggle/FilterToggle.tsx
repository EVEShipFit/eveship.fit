import type { CSSProperties } from "react";

import { Icon, useIconUrl, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import styles from "./FilterToggle.module.css";

export type FilterToggleProps = ({ icon: IconName; typeId?: undefined } | { icon?: undefined; typeId: number }) & {
  label: string;
  pressed?: boolean;
  /** Without it, the filter shows as not implemented yet. */
  onPressedChange?: (pressed: boolean) => void;
};

/** One of the icons above EVE's lists that filter them. */
export function FilterToggle({ icon, typeId, label, pressed = false, onPressedChange }: FilterToggleProps) {
  const texture = useIconUrl(icon);
  const implemented = onPressedChange !== undefined;

  return (
    <Tooltip label={implemented ? label : `${label} (not implemented yet)`}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={label}
        aria-pressed={pressed}
        aria-disabled={!implemented || undefined}
        style={texture === undefined ? undefined : ({ "--texture": `url(${texture})` } as CSSProperties)}
        onClick={() => onPressedChange?.(!pressed)}
      >
        {icon === undefined ? <TypeIcon typeId={typeId} /> : <Icon name={icon} />}
        {pressed && (
          <span className={styles.check}>
            <Icon name="checkmark" />
          </span>
        )}
      </button>
    </Tooltip>
  );
}
