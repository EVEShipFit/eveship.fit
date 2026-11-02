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
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties } from "react";

import { useContextMenu } from "../../primitives/ContextMenu/ContextMenu";
import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import { useAnchoredCard } from "../ItemInfo/anchoredCard";
import info from "../ItemInfo/ItemInfo.module.css";
import styles from "./Mutate.module.css";
import { MutaplasmidPicker } from "./MutaplasmidPicker";

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
  const { open: openMenu, menu } = useContextMenu();
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
  const reroll = (kind: RollKind) => commit(rollMutation(sde, roll.base, roll.mutaplasmid, kind));
  const choose = (picked: number) => {
    const attributes: Record<number, number> = {};
    for (const range of mutationRanges(sde, roll.base, picked)) {
      attributes[range.attributeId] = clamp(roll.attributes[range.attributeId] ?? range.base, range);
    }
    commit({ base: roll.base, mutaplasmid: picked, attributes });
  };

  return (
    <section
      ref={card}
      className={`${info.card} ${styles.card}`}
      popover="auto"
      onToggle={(event) => {
        if (event.target === event.currentTarget && event.newState === "closed") onClose();
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
            <div className={styles.toolbar}>
              <MutaplasmidPicker mutaplasmids={mutaplasmids} roll={roll} onChoose={choose} />
              <span className={styles.roll}>
                <button
                  type="button"
                  className={styles.dice}
                  aria-label="Roll"
                  title="Roll"
                  onClick={() => reroll("random")}
                >
                  <Dice />
                </button>
                <button
                  type="button"
                  className={styles.more}
                  aria-label="More Rolls"
                  aria-haspopup="menu"
                  onClick={(event) =>
                    openMenu(event, [
                      { label: "Best Roll", onSelect: () => reroll("best") },
                      { label: "Worst Roll", onSelect: () => reroll("worst") },
                    ])
                  }
                >
                  ▾
                </button>
              </span>
            </div>
            {menu}
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
      <span className={styles.name} title={name}>
        {name}
      </span>
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

function Dice() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" />
      <circle cx="5" cy="5" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="11" cy="11" r="1.3" fill="currentColor" />
    </svg>
  );
}
