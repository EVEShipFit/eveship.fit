import { useState, type DragEvent, type ReactNode } from "react";

import { TypeIcon } from "../TypeIcon/TypeIcon";
import styles from "./TreeList.module.css";

export interface TreeListProps {
  label: string;
  children: ReactNode;
}

export function TreeList({ label, children }: TreeListProps) {
  return (
    <ul className={styles.tree} aria-label={label}>
      {children}
    </ul>
  );
}

export interface TreeGroupProps {
  label: ReactNode;
  defaultOpen?: boolean;
  /** Only called while the group is open, so large trees stay cheap. */
  children: () => ReactNode;
}

export function TreeGroup({ label, defaultOpen = false, children }: TreeGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li>
      <button type="button" className={styles.row} aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg className={styles.chevron} viewBox="0 0 12 12" width={12} height={12} aria-hidden>
          <path d="M3 1.5 9.5 6 3 10.5Z" fill="currentColor" />
        </svg>
        {label}
      </button>
      {open && <ul className={styles.group}>{children()}</ul>}
    </li>
  );
}

export interface TreeLeafProps {
  label: ReactNode;
  /** Shows the type's icon in front of the label. */
  typeId?: number;
  title?: string;
  onActivate?: () => void;
  onHover?: (hovering: boolean) => void;
  onDragStart?: (event: DragEvent) => void;
  onDragEnd?: () => void;
  /** Shown at the end of the row, like a count or an action. */
  after?: ReactNode;
}

/** Activates on double click, as EVE's own lists do; single clicks are for selecting text and dragging. */
export function TreeLeaf({ label, typeId, title, onActivate, onHover, onDragStart, onDragEnd, after }: TreeLeafProps) {
  return (
    <li>
      <div
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Firefox does not start a drag from a <button>.
        role="button"
        tabIndex={0}
        className={styles.row}
        title={title}
        draggable={onDragStart !== undefined}
        onDoubleClick={onActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter") onActivate?.();
        }}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {typeId !== undefined && <TypeIcon typeId={typeId} size={20} />}
        <span className={styles.label}>{label}</span>
        {after}
      </div>
    </li>
  );
}
