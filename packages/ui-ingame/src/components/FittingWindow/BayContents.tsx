import { useBayContents, useFitStore } from "@eveshipfit/react-hooks";
import { useRef } from "react";

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
            <span className={styles.quantity}>{quantity} x</span>
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
                else next.querySelector("button")?.focus();
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
