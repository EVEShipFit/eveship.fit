import { useId, useState, type DragEvent, type ReactNode } from "react";

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
  /** Shows the type's icon in front of the label. */
  typeId?: number;
  /** The URL of a small image in front of the label, like a market group's icon. */
  icon?: string;
  /** A second line under the label. */
  description?: ReactNode;
  defaultOpen?: boolean;
  /** Shown at the end of the row, like a count or an action. */
  after?: ReactNode;
  onDragStart?: (event: DragEvent) => void;
  onDragEnd?: () => void;
  /** Only called while the group is open, so large trees stay cheap. */
  children: () => ReactNode;
}

export function TreeGroup({
  label,
  typeId,
  icon,
  description,
  defaultOpen = false,
  after,
  onDragStart,
  onDragEnd,
  children,
}: TreeGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const descriptionId = useId();

  return (
    <li>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.row}
          aria-expanded={open}
          aria-describedby={description !== undefined ? descriptionId : undefined}
          draggable={onDragStart !== undefined || undefined}
          onClick={() => setOpen(!open)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <svg className={styles.chevron} viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.5 9.5 6 3 10.5Z" fill="currentColor" />
          </svg>
          {typeId !== undefined && <RowIcon typeId={typeId} />}
          {icon !== undefined && <img className={styles.smallIcon} src={icon} alt="" draggable={false} />}
          <span className={styles.text}>
            <span className={styles.label}>{label}</span>
            {description !== undefined && (
              <span id={descriptionId} className={styles.label} aria-hidden>
                {description}
              </span>
            )}
          </span>
        </button>
        {after}
      </div>
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
    <li className={`${styles.head} ${styles.leaf}`}>
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
        {typeId !== undefined && <RowIcon typeId={typeId} />}
        <span className={styles.label}>{label}</span>
      </div>
      {after}
    </li>
  );
}

function RowIcon({ typeId }: { typeId: number }) {
  return (
    <span className={styles.icon}>
      <TypeIcon typeId={typeId} />
    </span>
  );
}
