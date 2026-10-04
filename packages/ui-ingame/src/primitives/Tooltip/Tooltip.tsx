import { useId, useRef, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";

import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** Without one, there is no tooltip. */
  label?: ReactNode;
  /** The tooltip points at the first element. */
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
      onFocus={(event: FocusEvent) => {
        const target = event.target;
        setTimeout(() => show(target.matches(":focus-visible")));
      }}
      onBlur={() => show(false)}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Escape") show(false);
      }}
    >
      {children}
      {label !== undefined && (
        <span ref={tooltip} className={styles.tooltip} popover="hint" aria-hidden>
          <span className={styles.notch} />
          <span className={styles.label}>{label}</span>
        </span>
      )}
    </span>
  );
}

export interface TooltipTextProps {
  title: ReactNode;
  description?: ReactNode;
}

/** A tooltip's `label` with a title; give several to stack them. */
export function TooltipText({ title, description }: TooltipTextProps) {
  return (
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      {description}
    </span>
  );
}
