import { useBayContents, useFitStore } from "@eveshipfit/react-hooks";
import { useRef, useState, type KeyboardEvent } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./BayContents.module.css";

const emptyText = { cargo: "No Cargo Items Simulated", droneBay: "No Drones Simulated" };

/** EVE's list of what is in a bay, as a popover anchored to `--bay-anchor`. */
export function BayContents({ id, bay, label }: { id: string; bay: "cargo" | "droneBay"; label: string }) {
  const store = useFitStore();
  const contents = useBayContents(bay);
  const panel = useRef<HTMLDivElement>(null);

  if (contents.length === 0) {
    return (
      <div id={id} className={styles.panel} popover="auto" data-empty>
        {emptyText[bay]}
      </div>
    );
  }

  return (
    <div ref={panel} id={id} className={styles.panel} popover="auto">
      <ul className={styles.list} aria-label={label}>
        {contents.map(({ type, quantity, refs }) => (
          <li key={type.id} className={styles.row}>
            <Quantity
              label={`Number of ${type.name}`}
              value={quantity}
              onChange={(value) => store.setCargoQuantity(type.id, value)}
            />
            <span className={styles.icon}>
              <TypeIcon typeId={type.id} />
            </span>
            <span className={styles.name}>{type.name}</span>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${type.name}`}
              onClick={(event) => {
                const row = event.currentTarget.closest("li")!;
                const next = row.nextElementSibling ?? row.previousElementSibling;
                if (next === null) panel.current?.hidePopover();
                else next.querySelector<HTMLElement>(`.${styles.remove}`)?.focus();
                store.remove(...refs);
              }}
            >
              <Icon name="close" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.removeAll}
        onClick={() => {
          panel.current?.hidePopover();
          store.remove(...contents.flatMap(({ refs }) => refs));
        }}
      >
        Remove All
      </button>
    </div>
  );
}

/** EVE's count of a row, which turns into a spinner on hover and focus. */
function Quantity({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState<string>();
  const cancelled = useRef(false);

  const set = (next: number) => {
    setDraft(undefined);
    if (Number.isInteger(next) && next >= 1 && next !== value) onChange(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") set(Number(draft ?? value));
    if (event.key === "Escape") cancelled.current = true;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      set(value + (event.key === "ArrowUp" ? 1 : -1));
    }
  };

  return (
    <span className={styles.quantity}>
      <input
        type="number"
        className={styles.count}
        aria-label={label}
        min={1}
        value={draft ?? value}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft !== undefined && !cancelled.current) set(Number(draft));
          else setDraft(undefined);
          cancelled.current = false;
        }}
      />
      <span className={styles.times}>x</span>
      <span className={styles.steps}>
        <button type="button" tabIndex={-1} aria-label={`${label}: one more`} onClick={() => set(value + 1)}>
          <Icon name="arrow-up" />
        </button>
        <button type="button" tabIndex={-1} aria-label={`${label}: one less`} onClick={() => set(value - 1)}>
          <Icon name="arrow-down" />
        </button>
      </span>
    </span>
  );
}
