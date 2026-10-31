import { useId, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";

import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import styles from "./TreeList.module.css";

export interface TreeListProps {
  label: string;
  children: ReactNode;
}

/** Arrow keys, Home and End walk the open rows. */
export function TreeList({ label, children }: TreeListProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Handles the keys of its rows.
    <ul className={styles.tree} aria-label={label} onKeyDown={walk}>
      {children}
    </ul>
  );
}

function rows(scope: ParentNode): HTMLElement[] {
  return [...scope.querySelectorAll<HTMLElement>(`.${styles.row}`)];
}

const walkKeys = new Set(["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"]);

function hasModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function walk(event: KeyboardEvent<HTMLUListElement>) {
  if (event.defaultPrevented || hasModifier(event) || !walkKeys.has(event.key)) return;
  const tree = event.currentTarget;
  const all = rows(tree);
  const row = event.target as HTMLElement;
  const index = all.indexOf(row);
  if (index === -1) return;

  let next: HTMLElement | undefined;
  switch (event.key) {
    case "ArrowDown":
      next = all[index + 1];
      break;
    case "ArrowUp":
      next = all[index - 1];
      break;
    case "Home":
      next = all[0];
      break;
    case "End":
      next = all.at(-1);
      break;
    case "ArrowRight":
      if (row.getAttribute("aria-expanded") === "true") next = all[index + 1];
      break;
    case "ArrowLeft": {
      const parent = row.closest("li")?.parentElement?.closest("li");
      if (parent && tree.contains(parent)) next = parent.querySelector<HTMLElement>(`.${styles.row}`) ?? undefined;
      break;
    }
  }
  if (next === undefined) return;
  event.preventDefault();
  next.focus();
}

/** Focuses the first row of the first `TreeList` in `scope`. */
export function focusTree(scope: ParentNode): boolean {
  const first = scope.querySelector<HTMLElement>(`.${styles.tree} .${styles.row}`);
  first?.focus();
  return first !== null;
}

export function isTreeRow(element: Element): boolean {
  return element.matches(`.${styles.tree} .${styles.row}`);
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
        <div
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Firefox does not start a drag from a <button>.
          role="button"
          tabIndex={0}
          className={styles.row}
          aria-expanded={open}
          aria-describedby={description !== undefined ? descriptionId : undefined}
          draggable={onDragStart !== undefined || undefined}
          onClick={() => setOpen(!open)}
          onKeyDown={(event) => {
            const press = event.key === "Enter" || event.key === " ";
            const arrow = !hasModifier(event) && event.key === (open ? "ArrowLeft" : "ArrowRight");
            if (!press && !arrow) return;
            event.preventDefault();
            setOpen(!open);
          }}
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
        </div>
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
  /** Only called once the tooltip has opened. */
  renderTooltip?: () => ReactNode;
  onActivate?: () => void;
  /** Activates on a single click. */
  activateOnClick?: boolean;
  onHover?: (hovering: boolean) => void;
  onDragStart?: (event: DragEvent) => void;
  onDragEnd?: () => void;
  /** Shown at the end of the row, like a count or an action. */
  after?: ReactNode;
}

/** Activates on double click, as EVE's own lists do, unless `activateOnClick` is set. */
export function TreeLeaf({
  label,
  typeId,
  title,
  renderTooltip,
  onActivate,
  activateOnClick = false,
  onHover,
  onDragStart,
  onDragEnd,
  after,
}: TreeLeafProps) {
  return (
    <li className={`${styles.head} ${styles.leaf}`}>
      <Tooltip label={renderTooltip}>
        <div
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Firefox does not start a drag from a <button>.
          role="button"
          tabIndex={0}
          className={styles.row}
          title={title}
          draggable={onDragStart !== undefined}
          onClick={activateOnClick ? onActivate : undefined}
          onDoubleClick={activateOnClick ? undefined : onActivate}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onActivate?.();
          }}
          onMouseEnter={() => onHover?.(true)}
          onMouseLeave={() => onHover?.(false)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {typeId !== undefined && <RowIcon typeId={typeId} />}
          <span className={styles.label}>{label}</span>
        </div>
      </Tooltip>
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
