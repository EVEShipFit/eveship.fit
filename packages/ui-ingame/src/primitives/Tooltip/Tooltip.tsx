import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** Without one, there is no tooltip; a function is only called once the tooltip has opened. */
  label?: ReactNode | (() => ReactNode);
  /** The tooltip points at the first element. */
  children: ReactNode;
  /** Lets the tooltip grow as wide as its label. */
  wide?: boolean;
}

/**
 * Screen readers do not get the tooltip; name `children` itself, like with `aria-label`.
 *
 * Firefox places the tooltip as if `children` had no CSS transform, so do not rotate or scale it, or its parents.
 */
export function Tooltip({ label, children, wide }: TooltipProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const id = useId().replace(/[^\w-]/g, "");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    if (element === null) return;
    const wheel = (event: WheelEvent) => {
      const open = tooltip.current;
      if (!open?.matches(":popover-open") || open.contains(event.target as Node)) return;
      const scroller = scrollerIn(open, event.deltaY);
      if (scroller === undefined) return;
      event.preventDefault();
      scroller.scrollBy({ top: event.deltaY });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  const show = (open: boolean) => {
    if (open) setOpened(true);
    tooltip.current?.togglePopover(open);
  };

  return (
    <span
      ref={anchor}
      className={styles.anchor}
      role="presentation"
      style={{ "--tooltip-anchor": `--tooltip-anchor-${id}`, "--tooltip-box": `--tooltip-box-${id}` } as CSSProperties}
      onPointerEnter={() => show(true)}
      onPointerLeave={() => show(false)}
      onClick={() => show(true)}
      onFocus={(event: FocusEvent) => {
        const target = event.target;
        setTimeout(() => {
          if (target.matches(":focus-visible")) show(true);
        });
      }}
      onBlur={() => show(false)}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Escape") show(false);
      }}
    >
      {children}
      {label !== undefined && (
        <span ref={tooltip} className={styles.tooltip} data-wide={wide || undefined} popover="hint" aria-hidden>
          <span className={styles.notch} />
          <span className={styles.label}>{typeof label === "function" ? opened && label() : label}</span>
        </span>
      )}
    </span>
  );
}

/** The first element in `root` that can still scroll by `delta`. */
function scrollerIn(root: Element, delta: number): Element | undefined {
  for (const element of root.querySelectorAll("*")) {
    if (element.scrollHeight <= element.clientHeight) continue;
    const room = delta > 0 ? element.scrollHeight - element.clientHeight - element.scrollTop : element.scrollTop;
    if (room > 0) return element;
  }
  return undefined;
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
