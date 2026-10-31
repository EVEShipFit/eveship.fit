import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import styles from "./ContextMenu.module.css";

export interface ContextMenuItem {
  label: string;
  icon?: IconName;
  onSelect: () => void;
}

/** A separator draws a line between two groups of items. */
export type ContextMenuEntry = ContextMenuItem | "separator";

interface Opened {
  x: number;
  y: number;
  entries: ContextMenuEntry[];
}

export interface ContextMenu {
  /** Call from `onContextMenu`; without entries, the browser's own menu shows. */
  open: (event: MouseEvent, entries: (ContextMenuEntry | false | undefined)[]) => void;
  /** Render this once. */
  menu: ReactNode;
}

/** The menu EVE shows on right click. */
export function useContextMenu(): ContextMenu {
  const [opened, setOpened] = useState<Opened>();

  const open: ContextMenu["open"] = (event, entries) => {
    const shown = tidy(entries);
    if (shown.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    let { clientX: x, clientY: y } = event;
    if (event.button !== 2 && x === 0 && y === 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left;
      y = rect.bottom;
    }
    setOpened({ x, y, entries: shown });
  };

  return {
    open,
    menu: opened && (
      <Menu opened={opened} onClose={() => setOpened((current) => (current === opened ? undefined : current))} />
    ),
  };
}

function tidy(entries: (ContextMenuEntry | false | undefined)[]): ContextMenuEntry[] {
  const shown: ContextMenuEntry[] = [];
  for (const entry of entries) {
    if (!entry) continue;
    if (entry === "separator" && (shown.length === 0 || shown.at(-1) === "separator")) continue;
    shown.push(entry);
  }
  if (shown.at(-1) === "separator") shown.pop();
  return shown;
}

const stopped = (event: { stopPropagation: () => void }) => event.stopPropagation();

function Menu({ opened, onClose }: { opened: Opened; onClose: () => void }) {
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = menu.current;
    if (element === null) return;
    if (!element.matches(":popover-open")) element.showPopover();
    const { width, height } = element.getBoundingClientRect();
    const left = opened.x + width > innerWidth ? Math.max(0, opened.x - width) : opened.x;
    const top = opened.y + height > innerHeight ? Math.max(0, opened.y - height) : opened.y;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.focus();
  }, [opened]);

  const select = (item: ContextMenuItem) => {
    menu.current?.hidePopover();
    item.onSelect();
  };

  return (
    <div
      ref={menu}
      className={styles.menu}
      popover="auto"
      role="menu"
      tabIndex={-1}
      onToggle={(event) => {
        if (event.newState === "closed") onClose();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        walk(event);
      }}
      onClick={stopped}
      onDoubleClick={stopped}
      onPointerDown={stopped}
      onMouseDown={stopped}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {opened.entries.map((entry, index) =>
        entry === "separator" ? (
          // oxlint-disable-next-line react/no-array-index-key -- Separators have nothing else to tell them apart.
          <hr key={index} className={styles.separator} />
        ) : (
          <button
            key={entry.label}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => select(entry)}
            onPointerMove={(event) => event.currentTarget.focus()}
          >
            <span className={styles.icon}>{entry.icon && <Icon name={entry.icon} />}</span>
            {entry.label}
          </button>
        ),
      )}
    </div>
  );
}

function walk(event: KeyboardEvent<HTMLDivElement>) {
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]")];
  const index = items.indexOf(document.activeElement as HTMLElement);
  let next: HTMLElement | undefined;
  switch (event.key) {
    case "ArrowDown":
      next = items[(index + 1) % items.length];
      break;
    case "ArrowUp":
      next = items.at(index <= 0 ? -1 : index - 1);
      break;
    case "Home":
      next = items[0];
      break;
    case "End":
      next = items.at(-1);
      break;
    case "Escape":
      event.currentTarget.hidePopover();
      break;
    case "Tab":
      event.preventDefault();
      return;
    default:
      return;
  }
  event.preventDefault();
  next?.focus();
}
