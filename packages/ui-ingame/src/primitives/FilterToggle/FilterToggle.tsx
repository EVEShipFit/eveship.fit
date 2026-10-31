import type { CSSProperties } from "react";

import { Icon, useIconUrl, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import styles from "./FilterToggle.module.css";

export type FilterToggleProps = (
  | { icon: IconName; typeId?: undefined; src?: undefined }
  | { icon?: undefined; typeId: number; src?: undefined }
  /** The URL of an image, like a market group's icon. */
  | { icon?: undefined; typeId?: undefined; src: string | undefined }
) & {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  /** Without it, the filter shows as not implemented yet. */
  onPressedChange?: (pressed: boolean) => void;
};

/** One of the icons above EVE's lists that filter them. */
export function FilterToggle({
  icon,
  typeId,
  src,
  label,
  pressed = false,
  disabled = false,
  onPressedChange,
}: FilterToggleProps) {
  const texture = useIconUrl(icon) ?? src;
  const implemented = onPressedChange !== undefined;

  return (
    <Tooltip label={implemented ? label : `${label} (not implemented yet)`}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={label}
        aria-pressed={pressed}
        aria-disabled={!implemented || disabled || undefined}
        style={texture === undefined ? undefined : ({ "--texture": `url(${texture})` } as CSSProperties)}
        onClick={() => {
          if (!disabled) onPressedChange?.(!pressed);
        }}
      >
        {icon !== undefined ? (
          <Icon name={icon} />
        ) : typeId !== undefined ? (
          <TypeIcon typeId={typeId} />
        ) : (
          <img className={styles.image} src={src} alt="" draggable={false} />
        )}
        {pressed && (
          <span className={styles.check}>
            <Icon name="checkmark" />
          </span>
        )}
      </button>
    </Tooltip>
  );
}
