import type { MouseEventHandler } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./SlotAction.module.css";

/** One of the buttons EVE shows over a hovered slot. */
export function SlotAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Tooltip label={label}>
      <button type="button" className={styles.button} aria-label={label} onClick={onPress}>
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

export function SlotInfo() {
  return (
    <Tooltip label="Show Info (not implemented yet)">
      <button type="button" className={styles.button} aria-label="Show Info" aria-disabled>
        <Icon name="module-info" />
      </button>
    </Tooltip>
  );
}

/** Makes the whole slot a button, named `label`. */
export function SlotPress({
  className,
  label,
  onPress,
}: {
  className?: string;
  label?: string;
  onPress: MouseEventHandler<HTMLElement>;
}) {
  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Firefox does not start a drag from a <button>.
      role="button"
      tabIndex={0}
      className={className}
      aria-label={label}
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: event.shiftKey }));
      }}
    />
  );
}
