import { canMutate, mutaplasmidsOf, mutatedDronesOf, rollMutation } from "@eveshipfit/fitting";
import {
  useBayContents,
  useDrag,
  useDroneRoom,
  useFitStore,
  useMutate,
  useSde,
  useSnapshot,
  type BayContent,
} from "@eveshipfit/react-hooks";
import { useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";

import { useContextMenu } from "../../primitives/ContextMenu/ContextMenu";
import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./BayContents.module.css";
import { DroneTooltip } from "./DroneTooltip";
import { FighterTubes } from "./FighterTubes";

export type Bay = "cargo" | "droneBay" | "fighterBay";

const emptyText: Record<Bay, string> = {
  cargo: "No Cargo Items Simulated",
  droneBay: "No Drones Simulated",
  fighterBay: "No Fighters Simulated in Fighter Bay",
};

/** EVE's list of what is in a bay, as a popover anchored to `--bay-anchor`; the fighter bay's has its tubes above. */
export function BayContents({ id, bay, label }: { id: string; bay: Bay; label: string }) {
  const store = useFitStore();
  const sde = useSde();
  const { start, end } = useDrag();
  const { show: showMutate } = useMutate();
  const { open, menu } = useContextMenu();
  const contents = useBayContents(bay);
  const panel = useRef<HTMLDivElement>(null);
  const drones = bay === "droneBay";
  const fighters = bay === "fighterBay";
  const { fit, stats } = useSnapshot();
  const maxActive = stats.character.get("maxActiveDrones") ?? 0;
  const launched = fighters ? fit.items.flatMap((item, ref) => (item.slot.type === "fighter_tube" ? [ref] : [])) : [];
  const all = [...contents.flatMap(({ refs }) => refs), ...launched];

  if (!fighters && contents.length === 0) {
    return (
      <div id={id} className={styles.panel} popover="auto" data-empty>
        {emptyText[bay]}
      </div>
    );
  }

  const setQuantity = ({ type: { id: typeId }, mutatedFrom }: BayContent, quantity: number) => {
    if (mutatedFrom) store.setMutatedDroneQuantity(mutatedFrom.id, quantity);
    else if (drones) store.setDroneQuantity(typeId, quantity);
    else if (fighters) store.setFighterBayQuantity(typeId, quantity);
    else store.setCargoQuantity(typeId, quantity);
  };

  const openMenu = (event: MouseEvent, { type, mutatedFrom, refs }: BayContent) => {
    const unmutated = mutatedFrom ?? type;
    if (!canMutate(sde, unmutated) || (mutatedFrom && !mutatedDronesOf(sde, fit, mutatedFrom.id))) return;
    const mutate = () => {
      if (!mutatedFrom)
        store.setDronesMutation(refs, rollMutation(sde, type.id, mutaplasmidsOf(sde, type.id)[0]!.id, "base"));
      showMutate({ type: "drone_bay" }, { element: panel.current!.parentElement!, side: "right" }, unmutated.id);
    };
    open(event, [
      { label: mutatedFrom ? "Edit Mutation" : "Mutate", onSelect: mutate },
      mutatedFrom && { label: "Remove Mutation", onSelect: () => store.setDronesMutation(refs, undefined) },
    ]);
  };

  return (
    <div
      ref={panel}
      id={id}
      className={styles.panel}
      popover="auto"
      data-drones={drones || undefined}
      data-fighters={fighters || undefined}
    >
      {drones && (
        <div className={styles.activeDrones}>
          Active drones: {stats.ship.get("droneActive") ?? 0} / {maxActive}
        </div>
      )}
      {fighters && <FighterTubes />}
      {menu}
      {contents.length === 0 ? (
        <div className={styles.none}>{emptyText[bay]}</div>
      ) : (
        <ul className={styles.list} aria-label={label}>
          {contents.map((content) => {
            const { type, quantity, refs, key, mutatedFrom, rolls } = content;
            const drag = {
              draggable: mutatedFrom === undefined,
              onDragStart: (event: DragEvent<HTMLElement>) => {
                const icon = event.currentTarget.closest("li")!.querySelector(`.${styles.icon}`)!;
                event.dataTransfer.setDragImage(icon, 0, 0);
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("text/plain", type.name);
                start({ type: "type", typeId: type.id });
              },
              onDragEnd: end,
            };
            const shown = refs.find((ref) => fit.items[ref]?.state === "active") ?? refs[0]!;
            const name = mutatedFrom ? `Mutated ${mutatedFrom.name}` : type.name;
            return (
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Opens the menu of its row.
              <li
                key={key}
                className={styles.row}
                onContextMenu={drones ? (event) => openMenu(event, content) : undefined}
              >
                <Quantity name={name} value={quantity} onChange={(value) => setQuantity(content, value)} />
                <Tooltip
                  label={
                    drones ? <DroneTooltip itemRef={shown} typeId={type.id} mutatedFrom={mutatedFrom?.id} /> : undefined
                  }
                >
                  <span className={styles.icon} {...drag}>
                    <TypeIcon typeId={type.id} />
                  </span>
                </Tooltip>
                <span className={styles.middle} {...drag}>
                  <span className={styles.name} data-mutated={mutatedFrom !== undefined || undefined}>
                    {name}
                    {rolls > 1 && <span className={styles.rolls}> · {rolls} rolls</span>}
                  </span>
                  {drones && <DroneSelection content={content} max={maxActive} />}
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${name}`}
                  onClick={(event) => {
                    const row = event.currentTarget.closest("li")!;
                    const next = row.nextElementSibling ?? row.previousElementSibling;
                    store.remove(...refs);
                    if (next !== null) next.querySelector<HTMLElement>(`.${styles.remove}`)?.focus();
                    else if (!fighters) panel.current?.hidePopover();
                  }}
                >
                  <Icon name="close" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {all.length > 0 && (
        <button
          type="button"
          className={styles.removeAll}
          onClick={() => {
            store.remove(...all);
            panel.current?.hidePopover();
          }}
        >
          Remove All
        </button>
      )}
    </div>
  );
}

/** One box per drone the character can launch. */
function DroneSelection({
  content: { type, quantity, active, mutatedFrom },
  max,
}: {
  content: BayContent;
  max: number;
}) {
  const store = useFitStore();
  const room = useDroneRoom(mutatedFrom ?? type);
  const select = (count: number) => {
    if (mutatedFrom) store.setActiveMutatedDrones(mutatedFrom.id, count);
    else store.setActiveDrones(type.id, count);
  };

  return (
    <span
      className={styles.selection}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
      role="group"
      aria-label={`Active ${mutatedFrom ? `Mutated ${mutatedFrom.name}` : type.name}`}
    >
      Selected:
      {Array.from({ length: Math.max(max, active) }, (_, index) => {
        const count = index + 1;
        const state = count <= active ? "active" : count > quantity ? "none" : count <= active + room ? "open" : "over";
        return (
          <button
            key={count}
            type="button"
            className={styles.box}
            aria-label={`${count} active`}
            aria-pressed={count === active}
            data-state={state}
            disabled={state === "over" || state === "none"}
            onClick={() => select(count === active ? count - 1 : count)}
          >
            {count <= active && "×"}
          </button>
        );
      })}
    </span>
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
