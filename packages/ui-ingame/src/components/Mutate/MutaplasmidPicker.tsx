import { mutationRanges, type MutationRange, type MutationRoll } from "@eveshipfit/fitting";
import { formatNumber, useSde } from "@eveshipfit/react-hooks";
import type { SdeMutaplasmid } from "@eveshipfit/sde-loader";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import styles from "./Mutate.module.css";

export interface MutaplasmidPickerProps {
  mutaplasmids: readonly SdeMutaplasmid[];
  roll: MutationRoll;
  onChoose: (mutaplasmid: number) => void;
}

/** A dropdown of mutaplasmids, with a chart of how far the one pointed at rolls each stat. */
export function MutaplasmidPicker({ mutaplasmids, roll, onChoose }: MutaplasmidPickerProps) {
  const sde = useSde();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(roll.mutaplasmid);
  const names = shortNames(mutaplasmids.map((mutaplasmid) => sde.type(mutaplasmid.id)?.name ?? String(mutaplasmid.id)));
  const nameOf = (mutaplasmidId: number) => names[mutaplasmids.findIndex(({ id: other }) => other === mutaplasmidId)];

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus();
    const outside = (event: PointerEvent) => {
      if (!(event.target instanceof Node && root.current?.contains(event.target))) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const show = () => {
    setActive(roll.mutaplasmid);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };
  const choose = (mutaplasmidId: number) => {
    close();
    onChoose(mutaplasmidId);
  };
  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[role=menuitemradio]")];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[Math.min(items.length - 1, Math.max(0, index + step))]?.focus();
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  return (
    <div ref={root} className={styles.picker}>
      <button
        ref={button}
        type="button"
        className={styles.select}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          show();
        }}
      >
        <span className={styles.selected}>{nameOf(roll.mutaplasmid)}</span>
        <span className={styles.caret} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className={styles.menu}>
          <div
            ref={list}
            id={`${id}-menu`}
            className={styles.options}
            role="menu"
            aria-label="Mutaplasmid"
            tabIndex={-1}
            onKeyDown={onMenuKey}
          >
            {mutaplasmids.map((mutaplasmid, index) => (
              <button
                key={mutaplasmid.id}
                type="button"
                className={styles.option}
                role="menuitemradio"
                aria-checked={mutaplasmid.id === roll.mutaplasmid}
                tabIndex={-1}
                data-active={mutaplasmid.id === active || undefined}
                onFocus={() => setActive(mutaplasmid.id)}
                onPointerMove={(event) => event.currentTarget.focus()}
                onClick={() => choose(mutaplasmid.id)}
              >
                {names[index]}
              </button>
            ))}
          </div>
          <RangeChart mutaplasmids={mutaplasmids} shown={active} roll={roll} names={names} />
        </div>
      )}
    </div>
  );
}

interface RangeChartProps {
  mutaplasmids: readonly SdeMutaplasmid[];
  shown: number;
  roll: MutationRoll;
  names: readonly string[];
}

/** Each stat's range under one mutaplasmid, the widest one's behind it, and the roll. */
function RangeChart({ mutaplasmids, shown, roll, names }: RangeChartProps) {
  const sde = useSde();
  const rangesOf = (mutaplasmid: number) => mutationRanges(sde, roll.base, mutaplasmid);
  const all = mutaplasmids.flatMap(({ id }) =>
    rangesOf(id).flatMap((range) => [ratio(range, range.min), ratio(range, range.max)]),
  );
  const low = Math.min(1, ...all);
  const high = Math.max(1, ...all);
  const at = (value: number) => `${((value - low) / (high - low || 1)) * 100}%`;
  const widest = mutaplasmids.at(-1)?.id ?? shown;
  const behind = new Map(rangesOf(widest).map((range) => [range.attributeId, range]));
  const nameOf = (mutaplasmidId: number) => names[mutaplasmids.findIndex(({ id }) => id === mutaplasmidId)];

  return (
    <div className={styles.chart} aria-hidden>
      <span className={styles.chartTitle}>{nameOf(shown)}</span>
      {rangesOf(shown).map((range) => {
        const attribute = sde.attribute(range.attributeId);
        const widestRange = behind.get(range.attributeId);
        const [from, to] = ends(range);
        const rolled = roll.attributes[range.attributeId];
        return (
          <div key={range.attributeId} className={styles.chartRow}>
            <span className={styles.chartName}>{attribute?.displayName ?? attribute?.name}</span>
            <span className={styles.chartBar}>
              {shown !== widest && widestRange !== undefined && (
                <span className={styles.chartBehind} style={span(at, ...ends(widestRange))} />
              )}
              <span
                className={styles.chartRange}
                style={
                  { ...span(at, from, to), "--neutral": `${((1 - from) / (to - from || 1)) * 100}%` } as CSSProperties
                }
                data-up-is-good={upIsGood(range) || undefined}
              />
              <span className={styles.chartBase} style={{ left: at(1) }} />
              {rolled !== undefined && <span className={styles.chartRoll} style={{ left: at(ratio(range, rolled)) }} />}
            </span>
          </div>
        );
      })}
      <div className={styles.chartAxis}>
        <span>{percent(low)}</span>
        <span>base</span>
        <span>{percent(high)}</span>
      </div>
    </div>
  );
}

function percent(value: number): string {
  const sign = value > 1 ? "+" : value < 1 ? "−" : "";
  return `${sign}${formatNumber(Math.abs(value - 1) * 100, { decimals: 0 })}%`;
}

function ratio(range: MutationRange, value: number): number {
  return range.base === 0 ? 1 : value / range.base;
}

function ends(range: MutationRange): [number, number] {
  const a = ratio(range, range.min);
  const b = ratio(range, range.max);
  return [Math.min(a, b), Math.max(a, b)];
}

function span(at: (value: number) => string, from: number, to: number): CSSProperties {
  return { left: at(from), right: `calc(100% - ${at(to)})` };
}

/** Whether a bigger multiplier makes the stat better. */
function upIsGood(range: MutationRange): boolean {
  return range.highIsGood === range.base >= 0;
}

/** The names without the words they all have, like "Large Shield Extender Mutaplasmid". */
function shortNames(names: readonly string[]): string[] {
  const words = names.map((name) => name.split(" "));
  if (words.length === 1) return [words[0]!.filter((word) => word !== "Mutaplasmid").join(" ")];
  const shared = words[0]!.filter((word) => words.every((name) => name.includes(word)));
  const short = words.map((name) => name.filter((word) => !shared.includes(word)).join(" "));
  return short.every((name) => name !== "") ? short : [...names];
}
