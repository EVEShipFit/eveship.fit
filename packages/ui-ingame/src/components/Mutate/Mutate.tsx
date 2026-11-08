import {
  clampToRange,
  distinctRolls,
  mutaplasmidsOf,
  mutatedDronesOf,
  mutationRanges,
  mutationRollOf,
  parseItemLink,
  parseMutationText,
  rollFits,
  rollMutation,
  withMutaplasmid,
  type Fit,
  type FitStore,
  type MutatedDrones,
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
  useImages,
  useMutate,
  usePreview,
  useSde,
  type ShownMutation,
} from "@eveshipfit/react-hooks";
import type { Sde } from "@eveshipfit/sde-loader";
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { useContextMenu } from "../../primitives/ContextMenu/ContextMenu";
import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import { useAnchoredCard } from "../ItemInfo/anchoredCard";
import info from "../ItemInfo/ItemInfo.module.css";
import { slotName } from "../ItemInfo/slotName";
import styles from "./Mutate.module.css";
import { MutaplasmidPicker } from "./MutaplasmidPicker";

const PREVIEW_TARGET = "mutate";

/** The window to roll a fitted module's or the drones' mutation in, next to what asked for it. */
export function Mutate() {
  const { shown, close } = useMutate();
  if (shown === undefined) return null;
  if (shown.slot.type === "drone_bay") return <MutateDrones key={shown.base} shown={shown} onClose={close} />;
  return <MutateModule key={`${shown.slot.type} ${slotIndex(shown.slot)}`} shown={shown} onClose={close} />;
}

interface MutateTargetProps {
  shown: ShownMutation;
  onClose: () => void;
}

function useCloseWhenGone(gone: boolean, onClose: () => void) {
  const closeWhenGone = useEffectEvent(onClose);
  useEffect(() => {
    if (gone) closeWhenGone();
  }, [gone]);
}

function MutateModule({ shown, onClose }: MutateTargetProps) {
  const fit = useFit();
  const sde = useSde();
  const ref = refIn(fit, shown.slot);
  const item = fit.items[ref];
  const roll = item && mutationRollOf(sde, item);
  useCloseWhenGone(roll === undefined, onClose);

  if (item === undefined || roll === undefined) return null;
  return (
    <MutateCard
      shown={shown}
      typeId={item.type_id}
      roll={roll}
      apply={(store, next) => store.setMutation(refIn(store.getSnapshot().fit, shown.slot), next)}
      applyMutaplasmid={(store, picked) => store.setMutation(ref, withMutaplasmid(sde, roll, picked))}
      onClose={onClose}
    />
  );
}

function MutateDrones({ shown, onClose }: MutateTargetProps) {
  const fit = useFit();
  const sde = useSde();
  const drones = shown.base === undefined ? undefined : mutatedDronesOf(sde, fit, shown.base);
  useCloseWhenGone(drones === undefined, onClose);

  if (drones === undefined) return null;
  return <DronesCard shown={shown} typeId={fit.items[drones.refs[0]!]!.type_id} drones={drones} onClose={onClose} />;
}

interface DronesCardProps extends MutateTargetProps {
  typeId: number;
  drones: MutatedDrones;
}

/** The mutate window for the drones of a row: one roll for them all, or one for each. */
function DronesCard({ shown, typeId, drones: { rolls, active }, onClose }: DronesCardProps) {
  const sde = useSde();
  const store = useFitStore();
  const [split, setSplit] = useState(() => distinctRolls(rolls) > 1);
  const [selected, setSelected] = useState(0);
  const base = rolls[0]!.base;
  const each = rolls.length > 1 && (split || distinctRolls(rolls) > 1);
  const drone = Math.min(selected, rolls.length - 1);

  const rollsIn = (target: FitStore) => mutatedDronesOf(sde, target.getSnapshot().fit, base)?.rolls ?? [];

  const setEach = (next: boolean) => {
    setSplit(next);
    if (!next)
      store.setMutatedDrones(
        base,
        rolls.map(() => rolls[drone]!),
      );
  };
  const rollAll = (mutaplasmid: number) =>
    store.setMutatedDrones(
      base,
      rolls.map(() => rollMutation(sde, base, mutaplasmid, "random")),
    );

  return (
    <MutateCard
      shown={shown}
      typeId={typeId}
      roll={rolls[each ? drone : 0]!}
      rollLabel={each ? `Roll Drone ${drone + 1}` : "Roll"}
      apply={(target, next) =>
        target.setMutatedDrones(
          base,
          rollsIn(target).map((roll, index) => (!each || index === drone ? next : roll)),
        )
      }
      applyMutaplasmid={(target, picked) =>
        target.setMutatedDrones(
          base,
          rollsIn(target).map((roll, index) => (!each || index === drone ? withMutaplasmid(sde, roll, picked) : roll)),
        )
      }
      above={
        rolls.length > 1 && (
          <>
            {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls. */}
            <div className={styles.switch} role="group" aria-label="Rolls">
              <button type="button" aria-pressed={!each} onClick={() => setEach(false)}>
                One Roll for All {rolls.length}
              </button>
              <button type="button" aria-pressed={each} onClick={() => setEach(true)}>
                Each Drone Its Own Roll
              </button>
            </div>
            {each && (
              <div className={styles.chips}>
                {rolls.map((roll, index) => (
                  <DroneChip
                    // oxlint-disable-next-line react/no-array-index-key -- A drone is its place in the row.
                    key={index}
                    index={index}
                    roll={roll}
                    selected={index === drone}
                    launched={index < active}
                    onSelect={() => setSelected(index)}
                  />
                ))}
              </div>
            )}
          </>
        )
      }
      rollAll={each ? { label: `Roll All ${rolls.length}`, roll: rollAll } : undefined}
      onClose={onClose}
    />
  );
}

interface DroneChipProps {
  index: number;
  roll: MutationRoll;
  selected: boolean;
  launched: boolean;
  onSelect: () => void;
}

/** One drone of a row, with how it rolled the stat that matters most. */
function DroneChip({ index, roll, selected, launched, onSelect }: DroneChipProps) {
  const sde = useSde();
  const ranges = mutationRanges(sde, roll.base, roll.mutaplasmid);
  const range = ranges.find(({ attributeId }) => attributeId === sde.attributeId("damageMultiplier")) ?? ranges[0];
  const value = range && (roll.attributes[range.attributeId] ?? range.base);
  const change = range && value !== undefined && range.base !== 0 ? value / range.base - 1 : 0;
  const width =
    range && value !== undefined && range.max > range.min ? (value - range.min) / (range.max - range.min) : 0;
  const percent = formatNumber(Math.abs(change) * 100, { decimals: 1 });
  const better = change > 0 === (range?.highIsGood ?? true);

  return (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={selected}
      data-launched={launched || undefined}
      onClick={onSelect}
    >
      Drone {index + 1}
      <span className={styles.change} data-change={Number(percent) === 0 ? undefined : better ? "better" : "worse"}>
        {Number(percent) === 0 ? "0%" : `${change > 0 ? "+" : "-"}${percent}%`}
      </span>
      <span className={styles.chipBar}>
        <span style={{ width: `${width * 100}%` }} />
      </span>
    </button>
  );
}

type Tab = "attributes" | "import";

interface MutateCardProps extends MutateTargetProps {
  typeId: number;
  roll: MutationRoll;
  rollLabel?: string;
  /** Puts a roll in the fit, or in a preview of it. */
  apply: (store: FitStore, roll: MutationRoll) => void;
  applyMutaplasmid: (store: FitStore, mutaplasmid: number) => void;
  above?: ReactNode;
  rollAll?: { label: string; roll: (mutaplasmid: number) => void };
}

function MutateCard({
  shown: { slot, anchor },
  typeId,
  roll: fitted,
  rollLabel = "Roll",
  apply,
  applyMutaplasmid,
  above,
  rollAll,
  onClose,
}: MutateCardProps) {
  const sde = useSde();
  const store = useFitStore();
  const preview = usePreview();
  const { card, style } = useAnchoredCard(anchor, onClose);
  const { open: openMenu, menu } = useContextMenu();
  const tabId = useId();
  const [tab, setTab] = useState<Tab>("attributes");
  const [chosen, setChosen] = useState<number>();
  const [dragged, setDragged] = useState<MutationRoll>();
  const mutaplasmids = mutaplasmidsOf(sde, fitted.base);
  const mutaplasmid =
    chosen !== undefined && rollFits(sde, { ...fitted, mutaplasmid: chosen }) ? chosen : fitted.mutaplasmid;
  const roll = dragged ?? { ...fitted, mutaplasmid };
  const ranges = mutationRanges(sde, roll.base, roll.mutaplasmid);
  const base = sde.type(roll.base);

  const clearPreview = useEffectEvent(() => preview.clear(PREVIEW_TARGET));
  useEffect(() => () => clearPreview(), []);

  const commit = (next: MutationRoll) => {
    preview.clear(PREVIEW_TARGET);
    setDragged(undefined);
    setChosen(next.mutaplasmid);
    apply(store, next);
  };
  const drag = (next: MutationRoll) => {
    setDragged(next);
    preview.show((draft) => apply(draft, next), PREVIEW_TARGET);
  };
  const setValue = (range: MutationRange, value: number) =>
    drag({ ...roll, attributes: { ...roll.attributes, [range.attributeId]: clampToRange(value, range) } });
  const finish = () => {
    if (dragged !== undefined) commit(dragged);
  };
  const reroll = (kind: RollKind) => commit(rollMutation(sde, roll.base, roll.mutaplasmid, kind));
  const choose = (picked: number) => {
    preview.clear(PREVIEW_TARGET);
    setDragged(undefined);
    setChosen(picked);
    applyMutaplasmid(store, picked);
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
          <span>Fitted · {slotName(slot)}</span>
        </div>
      </header>
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
      <div className={styles.panel} role="tabpanel" aria-labelledby={`${tabId}-${tab}`}>
        {tab === "attributes" ? (
          <>
            <div className={styles.toolbar}>
              <MutaplasmidPicker mutaplasmids={mutaplasmids} roll={roll} onChoose={choose} />
              <span className={styles.roll}>
                <button
                  type="button"
                  className={styles.dice}
                  aria-label={rollLabel}
                  title={rollLabel}
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
            {above}
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
            {rollAll && (
              <button type="button" className={styles.button} onClick={() => rollAll.roll(roll.mutaplasmid)}>
                {rollAll.label}
              </button>
            )}
          </>
        ) : (
          <Import
            current={fitted}
            apply={(next) => apply(store, next)}
            onFound={(found) => {
              setChosen(found.mutaplasmid);
              setTab("attributes");
            }}
          />
        )}
      </div>
    </section>
  );
}

const tabs: readonly Tab[] = ["attributes", "import"];
const tabLabels: Record<Tab, string> = { attributes: "Attributes", import: "Import" };

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
  const icon = useImages().attributeIcon(range.attributeId);
  const span = range.max - range.min;
  const base = `${span === 0 ? 50 : ((range.base - range.min) / span) * 100}%`;
  const change = range.base === 0 ? 0 : value / range.base - 1;
  const percent = formatNumber(Math.abs(change) * 100, { decimals: 1 });
  const unchanged = Number(percent) === 0;
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
        {icon === undefined ? <span className={styles.icon} /> : <img className={styles.icon} src={icon} alt="" />}
        <span className={styles.label}>{name}</span>
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
      <span className={styles.change} data-change={unchanged ? undefined : better ? "better" : "worse"}>
        {unchanged ? "0%" : `${change > 0 ? "+" : "-"}${percent}%`}
      </span>
    </div>
  );
}

interface ImportProps {
  current: MutationRoll;
  apply: (roll: MutationRoll) => void;
  onFound: (roll: MutationRoll) => void;
}

/** Rolls this module or drone like one pasted from Pyfa, or one in game looked up by its link or IDs. */
function Import({ current, apply: applyRoll, onFound }: ImportProps) {
  const engine = useEngine();
  const sde = useSde();
  const fieldId = useId();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ busy: true } | { error: string } | undefined>();
  const pasted = parseMutationText(sde, text);
  const ids = engine.esi === undefined ? undefined : parseItemLink(text);

  const apply = (roll: MutationRoll) => {
    if (current.base !== roll.base) {
      const name = (typeId: number) => sde.type(typeId)?.name;
      setStatus({ error: `That is a ${name(roll.base)}, not a ${name(current.base)}` });
      return;
    }
    applyRoll(roll);
    setStatus(undefined);
    onFound(roll);
  };

  const lookUp = async () => {
    if (pasted !== undefined) {
      apply(pasted);
      return;
    }
    if (ids === undefined) return;
    setStatus({ busy: true });
    try {
      apply(await engine.loadMutation(ids.typeId, ids.itemId));
    } catch (failure) {
      setStatus({ error: failure instanceof Error ? failure.message : String(failure) });
    }
  };

  return (
    <form
      className={styles.import}
      onSubmit={(event) => {
        event.preventDefault();
        void lookUp();
      }}
    >
      <label htmlFor={fieldId}>
        {engine.esi === undefined
          ? "Paste the item from Pyfa."
          : "Paste the item from Pyfa or its item link from EVE, or type its type ID and item ID."}
      </label>
      <textarea
        id={fieldId}
        className={styles.field}
        rows={5}
        placeholder={pyfaText(sde, current)}
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
          setStatus(undefined);
        }}
      />
      <button
        type="submit"
        className={styles.button}
        disabled={(pasted === undefined && ids === undefined) || (status !== undefined && "busy" in status)}
      >
        Apply
      </button>
      {status !== undefined && "error" in status && (
        <p className={styles.error} role="alert">
          {status.error}
        </p>
      )}
    </form>
  );
}

/** A roll as Pyfa copies a mutated module or drone. */
function pyfaText(sde: Sde, roll: MutationRoll): string {
  const values = Object.entries(roll.attributes)
    .map(([id, value]) => `${sde.attribute(Number(id))?.name ?? id} ${Number(value.toFixed(4))}`)
    .join(", ");
  return `${sde.type(roll.base)?.name ?? roll.base}\n${sde.type(roll.mutaplasmid)?.name ?? roll.mutaplasmid}\n${values}`;
}

function refIn(fit: Fit, slot: Slot): number {
  return fit.items.findIndex((item) => item.slot.type === slot.type && slotIndex(item.slot) === slotIndex(slot));
}

function slotIndex(slot: Slot): number | undefined {
  return "index" in slot ? slot.index : undefined;
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
