import { useId, useRef, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";

import styles from "./Tooltip.module.css";

export interface TooltipProps {
  label: ReactNode;
  /** One element, which the tooltip points at. */
  children: ReactNode;
}

/**
 * Screen readers do not get the tooltip; name `children` itself, like with `aria-label`.
 *
 * Firefox places the tooltip as if `children` had no CSS transform, so do not rotate or scale it, or its parents.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const tooltip = useRef<HTMLSpanElement>(null);
  const id = useId().replace(/[^\w-]/g, "");

  const show = (open: boolean) => tooltip.current?.togglePopover(open);

  return (
    <span
      className={styles.anchor}
      role="presentation"
      style={{ "--tooltip-anchor": `--tooltip-anchor-${id}`, "--tooltip-box": `--tooltip-box-${id}` } as CSSProperties}
      onPointerEnter={() => show(true)}
      onPointerLeave={() => show(false)}
      onFocus={(event: FocusEvent) => show(event.target.matches(":focus-visible"))}
      onBlur={() => show(false)}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Escape") show(false);
      }}
    >
      {children}
      <span ref={tooltip} className={styles.tooltip} popover="hint" aria-hidden>
        <span className={styles.notch} />
        <span className={styles.label}>{label}</span>
      </span>
    </span>
  );
}
