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
            <Quantity name={type.name} value={quantity} onChange={(value) => store.setCargoQuantity(type.id, value)} />
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
                store.remove(...refs);
                if (next === null) panel.current?.hidePopover();
                else next.querySelector<HTMLElement>(`.${styles.remove}`)?.focus();
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
          store.remove(...contents.flatMap(({ refs }) => refs));
          panel.current?.hidePopover();
        }}
      >
        Remove All
      </button>
    </div>
  );
}

/** EVE's count of a row, which turns into a spinner on hover and focus. */
function Quantity({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState<string>();
  const cancelled = useRef(false);
  const current = draft !== undefined && /^\d+$/.test(draft) ? Number(draft) : value;
  const shown = draft ?? String(value);

  const set = (next: number) => {
    setDraft(undefined);
    if (Number.isSafeInteger(next) && next >= 1 && next !== value) onChange(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") set(current);
    if (event.key === "Escape") {
      cancelled.current = true;
      setDraft(undefined);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      set(current + (event.key === "ArrowUp" ? 1 : -1));
    }
  };

  return (
    <span className={styles.quantity}>
      <input
        type="number"
        className={styles.count}
        style={{ width: `${Math.max(1, shown.length)}ch` }}
        aria-label={`Number of ${name}`}
        min={1}
        value={shown}
        onChange={(event) => {
          cancelled.current = false;
          setDraft(event.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft !== undefined && !cancelled.current) set(current);
          else setDraft(undefined);
        }}
      />
      <span className={styles.times}>x</span>
      <span className={styles.steps}>
        <button type="button" tabIndex={-1} aria-label={`One more ${name}`} onClick={() => set(current + 1)}>
          <Icon name="arrow-up" />
        </button>
        <button type="button" tabIndex={-1} aria-label={`One fewer ${name}`} onClick={() => set(current - 1)}>
          <Icon name="arrow-down" />
        </button>
      </span>
    </span>
  );
}
