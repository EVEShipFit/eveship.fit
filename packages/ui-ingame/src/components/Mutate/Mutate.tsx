import {
  mutaplasmidsOf,
  mutationRanges,
  mutationRollOf,
  parseItemLink,
  rollFits,
  rollMutation,
  type Fit,
  type MutationRange,
  type MutationRoll,
  type RollKind,
  type Slot,
} from "@eveshipfit/fitting";
import {
  formatAttribute,
  formatNumber,
  useEngine,
  useFit,
  useFitStore,
  useMutate,
  usePreview,
  useSde,
  type ShownMutation,
} from "@eveshipfit/react-hooks";
import type { SdeMutaplasmid } from "@eveshipfit/sde-loader";
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import { useAnchoredCard } from "../ItemInfo/anchoredCard";
import info from "../ItemInfo/ItemInfo.module.css";
import styles from "./Mutate.module.css";

const PREVIEW_TARGET = "mutate";

/** The window to roll a fitted module's mutation in, next to what asked for it. */
export function Mutate() {
  const { shown, close } = useMutate();
  const fit = useFit();
  const sde = useSde();
  const ref = shown === undefined ? -1 : refIn(fit, shown.slot);
  const item = fit.items[ref];
  const roll = item && mutationRollOf(sde, item);
  const gone = shown !== undefined && roll === undefined;

  const closeWhenGone = useEffectEvent(close);
  useEffect(() => {
    if (gone) closeWhenGone();
  }, [gone]);

  if (shown === undefined || item === undefined || roll === undefined) return null;
  return (
    <MutateCard
      key={`${shown.slot.type} ${slotIndex(shown.slot)}`}
      shown={shown}
      itemRef={ref}
      typeId={item.type_id}
      roll={roll}
      onClose={close}
    />
  );
}

type Tab = "roll" | "lookup";

interface MutateCardProps {
  shown: ShownMutation;
  itemRef: number;
  typeId: number;
  roll: MutationRoll;
  onClose: () => void;
}

function MutateCard({ shown: { slot, anchor }, itemRef: ref, typeId, roll: fitted, onClose }: MutateCardProps) {
  const sde = useSde();
  const engine = useEngine();
  const store = useFitStore();
  const preview = usePreview();
  const { card, style } = useAnchoredCard(anchor, onClose);
  const tabId = useId();
  const [tab, setTab] = useState<Tab>("roll");
  const [chosen, setChosen] = useState<number>();
  const [dragged, setDragged] = useState<MutationRoll>();
  const mutaplasmids = mutaplasmidsOf(sde, fitted.base);
  const mutaplasmid =
    chosen !== undefined && rollFits(sde, { ...fitted, mutaplasmid: chosen }) ? chosen : fitted.mutaplasmid;
  const roll = dragged ?? { ...fitted, mutaplasmid };
  const ranges = mutationRanges(sde, roll.base, roll.mutaplasmid);
  const base = sde.type(roll.base);
  const tabs: Tab[] = engine.esi === undefined ? ["roll"] : ["roll", "lookup"];

  const clearPreview = useEffectEvent(() => preview.clear(PREVIEW_TARGET));
  useEffect(() => () => clearPreview(), []);

  const commit = (next: MutationRoll) => {
    preview.clear(PREVIEW_TARGET);
    setDragged(undefined);
    setChosen(next.mutaplasmid);
    store.setMutation(ref, next);
  };
  const drag = (next: MutationRoll) => {
    setDragged(next);
    preview.show((draft) => draft.setMutation(ref, next), PREVIEW_TARGET);
  };
  const setValue = (range: MutationRange, value: number) =>
    drag({ ...roll, attributes: { ...roll.attributes, [range.attributeId]: clamp(value, range) } });
  const finish = () => {
    if (dragged !== undefined) commit(dragged);
  };
  const choose = (picked: number) => {
    const attributes: Record<number, number> = {};
    for (const range of mutationRanges(sde, roll.base, picked)) {
      attributes[range.attributeId] = clamp(roll.attributes[range.attributeId] ?? range.base, range);
    }
    commit({ base: roll.base, mutaplasmid: picked, attributes });
  };
  const reroll = (kind: RollKind) => commit(rollMutation(sde, roll.base, roll.mutaplasmid, kind));

  return (
    <section
      ref={card}
      className={`${info.card} ${styles.card}`}
      popover="auto"
      onToggle={(event) => {
        if (event.newState === "closed") onClose();
      }}
      aria-label={`Mutate ${base?.name ?? ""}`}
      data-side={anchor?.side}
      style={style}
    >
      <button type="button" className={info.close} aria-label="Close" onClick={onClose}>
        <Icon name="close" />
      </button>
      <header className={info.header}>
        <span className={info.typeIcon}>
          <TypeIcon typeId={typeId} size={64} />
        </span>
        <div className={info.title}>
          <h2 className={info.name}>Mutate {base?.name}</h2>
          <span className={info.muted}>{sde.type(roll.mutaplasmid)?.name}</span>
        </div>
      </header>
      {tabs.length > 1 && (
        <div className={info.tabs} role="tablist">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              id={`${tabId}-${name}`}
              className={info.tab}
              role="tab"
              aria-selected={name === tab}
              onClick={() => setTab(name)}
            >
              {tabLabels[name]}
            </button>
          ))}
        </div>
      )}
      <div className={styles.panel} role="tabpanel" aria-labelledby={`${tabId}-${tab}`}>
        {tab === "roll" ? (
          <>
            <Mutaplasmids mutaplasmids={mutaplasmids} current={roll.mutaplasmid} onChoose={choose} />
            <div className={styles.stats}>
              {ranges.map((range) => (
                <Stat
                  key={range.attributeId}
                  range={range}
                  value={roll.attributes[range.attributeId] ?? range.base}
                  onChange={(value) => setValue(range, value)}
                  onFinish={finish}
                />
              ))}
            </div>
            <div className={styles.buttons}>
              <button type="button" className={styles.button} onClick={() => reroll("random")}>
                Roll
              </button>
              <button type="button" className={styles.button} onClick={() => reroll("base")}>
                Base
              </button>
              <button type="button" className={styles.button} onClick={() => reroll("worst")}>
                Worst
              </button>
              <button type="button" className={styles.button} onClick={() => reroll("best")}>
                Best
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.remove}`}
                onClick={() => store.setMutation(ref, undefined)}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <Lookup
            slot={slot}
            onFound={(found) => {
              setChosen(found.mutaplasmid);
              setTab("roll");
            }}
          />
        )}
      </div>
    </section>
  );
}

const tabLabels: Record<Tab, string> = { roll: "Roll", lookup: "Look up" };

interface MutaplasmidsProps {
  mutaplasmids: readonly SdeMutaplasmid[];
  current: number;
  onChoose: (mutaplasmid: number) => void;
}

/** One button per mutaplasmid, with how far it rolls compared to the others. */
function Mutaplasmids({ mutaplasmids, current, onChoose }: MutaplasmidsProps) {
  const sde = useSde();
  const names = shortNames(mutaplasmids.map(({ id }) => sde.type(id)?.name ?? String(id)));
  const spreads = mutaplasmids.map(spreadOf);
  const widest = Math.max(...spreads.flatMap(({ min, max }) => [1 - min, max - 1]), 0.01);

  return (
    <fieldset className={styles.mutaplasmids} aria-label="Mutaplasmid">
      {mutaplasmids.map((mutaplasmid, index) => {
        const { min, max } = spreads[index]!;
        return (
          <button
            key={mutaplasmid.id}
            type="button"
            aria-pressed={mutaplasmid.id === current}
            className={styles.mutaplasmid}
            title={sde.type(mutaplasmid.id)?.name}
            onClick={() => onChoose(mutaplasmid.id)}
          >
            <span>{names[index]}</span>
            <span
              className={styles.spread}
              style={
                {
                  "--from": `${50 - ((1 - min) / widest) * 50}%`,
                  "--to": `${50 + ((max - 1) / widest) * 50}%`,
                } as CSSProperties
              }
            />
          </button>
        );
      })}
    </fieldset>
  );
}

interface StatProps {
  range: MutationRange;
  value: number;
  onChange: (value: number) => void;
  /** When the slider is let go. */
  onFinish: () => void;
}

function Stat({ range, value, onChange, onFinish }: StatProps) {
  const sde = useSde();
  const attribute = sde.attribute(range.attributeId);
  const name = attribute?.displayName ?? attribute?.name ?? String(range.attributeId);
  const span = range.max - range.min;
  const base = `${span === 0 ? 50 : ((range.base - range.min) / span) * 100}%`;
  const change = range.base === 0 ? 0 : value / range.base - 1;
  const better = value > range.base === range.highIsGood;
  const text = formatAttribute(sde, range.attributeId, value);
  const slider = useRef<HTMLInputElement>(null);
  const released = useEffectEvent(onFinish);
  useEffect(() => {
    const input = slider.current;
    const listener = () => released();
    input?.addEventListener("change", listener);
    return () => input?.removeEventListener("change", listener);
  }, []);

  return (
    <div className={styles.stat}>
      <span className={styles.name}>{name}</span>
      <span
        className={styles.slider}
        style={{ "--base": base } as CSSProperties}
        data-high-is-good={range.highIsGood || undefined}
      >
        <input
          ref={slider}
          type="range"
          aria-label={name}
          min={range.min}
          max={range.max}
          step="any"
          value={value}
          aria-valuetext={text}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          onPointerUp={onFinish}
          onBlur={onFinish}
        />
      </span>
      <span className={styles.value}>{text}</span>
      <span className={styles.change} data-change={change === 0 ? undefined : better ? "better" : "worse"}>
        {change === 0 ? "" : `${change > 0 ? "+" : ""}${formatNumber(change * 100, { decimals: 1 })}%`}
      </span>
    </div>
  );
}

/** Looks up a mutated item in game by its link or IDs, and rolls this module like it. */
function Lookup({ slot, onFound }: { slot: Slot; onFound: (roll: MutationRoll) => void }) {
  const engine = useEngine();
  const store = useFitStore();
  const sde = useSde();
  const fieldId = useId();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ busy: true } | { error: string } | undefined>();
  const ids = parseItemLink(text);

  const lookUp = async () => {
    if (ids === undefined) return;
    setStatus({ busy: true });
    try {
      const roll = await engine.loadMutation(ids.typeId, ids.itemId);
      const { fit } = store.getSnapshot();
      const ref = refIn(fit, slot);
      const base = fit.items[ref]?.mutation?.base;
      if (base !== roll.base) {
        const name = (typeId: number | undefined) => (typeId === undefined ? "module" : sde.type(typeId)?.name);
        setStatus({ error: `That is a ${name(roll.base)}, not a ${name(base)}` });
        return;
      }
      store.setMutation(ref, roll);
      setStatus(undefined);
      onFound(roll);
    } catch (failure) {
      setStatus({ error: failure instanceof Error ? failure.message : String(failure) });
    }
  };

  return (
    <form
      className={styles.lookup}
      onSubmit={(event) => {
        event.preventDefault();
        void lookUp();
      }}
    >
      <label htmlFor={fieldId}>Paste the item link from EVE, or type its type ID and item ID.</label>
      <input
        id={fieldId}
        className={styles.field}
        placeholder="47808 1043219876543"
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
          setStatus(undefined);
        }}
      />
      <button
        type="submit"
        className={styles.button}
        disabled={ids === undefined || (status !== undefined && "busy" in status)}
      >
        Look up
      </button>
      {status !== undefined && "error" in status && (
        <p className={styles.error} role="alert">
          {status.error}
        </p>
      )}
    </form>
  );
}

function refIn(fit: Fit, slot: Slot): number {
  return fit.items.findIndex((item) => item.slot.type === slot.type && slotIndex(item.slot) === slotIndex(slot));
}

function slotIndex(slot: Slot): number | undefined {
  return "index" in slot ? slot.index : undefined;
}

function clamp(value: number, range: MutationRange): number {
  return Math.min(range.max, Math.max(range.min, value));
}

/** The lowest and highest multiplier a mutaplasmid rolls, over all its attributes. */
function spreadOf(mutaplasmid: SdeMutaplasmid): { min: number; max: number } {
  const ranges = [...mutaplasmid.attributes.values()];
  return {
    min: Math.min(...ranges.map(({ min }) => min), 1),
    max: Math.max(...ranges.map(({ max }) => max), 1),
  };
}

/** The names without the words they all end in, like "Large Shield Extender Mutaplasmid". */
function shortNames(names: readonly string[]): string[] {
  const words = names.map((name) => name.split(" "));
  let shared = 0;
  while (
    words.every((name) => name.length > shared + 1) &&
    words.every((name) => name.at(-1 - shared) === words[0]!.at(-1 - shared))
  ) {
    shared++;
  }
  if (names.length === 1) shared = words[0]!.at(-1) === "Mutaplasmid" ? 1 : 0;
  return words.map((name) => name.slice(0, name.length - shared).join(" "));
}
