import { burstsOf, type Fit } from "@eveshipfit/fitting";
import {
  useEngine,
  useFitStore,
  useFleet,
  useHasFit,
  useLocalFits,
  usePersonalFits,
  useSde,
  type FleetBooster,
} from "@eveshipfit/react-hooks";
import { useId, useState } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./Fleet.module.css";
import browserStyles from "./ItemBrowser.module.css";

const statusNotes: Record<FleetBooster["status"], string | undefined> = {
  on: undefined,
  off: "Turned off",
  overridden: "Others hand out the same boosts",
  idle: "Hands out no boosts",
};

/** The Fleet tab of the `ItemBrowser`: the fits boosting this one with their command bursts. */
export function Fleet() {
  if (!useHasFit()) return <p className={browserStyles.empty}>Pick a hull first</p>;
  return <FleetPanel />;
}

function FleetPanel() {
  const fleet = useFleet();
  const [adding, setAdding] = useState<"paste" | "pick">();

  return (
    <div className={styles.fleet}>
      <div className={styles.header}>
        <span>Boosters</span>
        {fleet.boosters.length > 0 && (
          <Switch label="Boosts on" checked={fleet.on} onChange={fleet.setOn}>
            Boosts on
          </Switch>
        )}
      </div>
      <ul className={styles.boosters} aria-label="Boosters">
        {fleet.boosters.map((booster, index) => (
          <BoosterCard
            // oxlint-disable-next-line react/no-array-index-key -- A booster is its place in the list.
            key={index}
            booster={booster}
            onOff={(off) => fleet.setOff(index, off)}
            onRemove={() => fleet.remove(index)}
          />
        ))}
      </ul>
      {fleet.boosters.length === 0 && <p className={styles.hint}>Add a fit with command bursts to boost this one.</p>}
      <div className={styles.add}>
        <button type="button" className={browserStyles.action} onClick={() => setAdding("paste")}>
          Paste booster fit…
        </button>
        <button type="button" className={browserStyles.action} onClick={() => setAdding("pick")}>
          Pick from my fits
        </button>
      </div>
      <p className={styles.note}>Each buff counts once: the strongest one lands, like in game.</p>
      <Dialog open={adding === "paste"} title="Paste Booster Fit" onClose={() => setAdding(undefined)}>
        <PasteForm onDone={() => setAdding(undefined)} />
      </Dialog>
      <Dialog open={adding === "pick"} title="Pick a Booster" onClose={() => setAdding(undefined)}>
        <PickList onDone={() => setAdding(undefined)} />
      </Dialog>
    </div>
  );
}

function BoosterCard({
  booster,
  onOff,
  onRemove,
}: {
  booster: FleetBooster;
  onOff: (off: boolean) => void;
  onRemove: () => void;
}) {
  const sde = useSde();
  const hull = sde.type(booster.fit.ship.type_id)?.name ?? "Unknown hull";
  const name = booster.fit.name || hull;
  const note = statusNotes[booster.status];

  return (
    <li className={styles.card} data-status={booster.status} aria-label={name}>
      <div className={styles.cardHeader}>
        <TypeIcon typeId={booster.fit.ship.type_id} size={32} />
        <div className={styles.names}>
          <span className={styles.name}>{name}</span>
          <span className={styles.details}>{[hull, "All L5", note].filter(Boolean).join(" · ")}</span>
        </div>
        <Switch label={`Boost from ${name}`} checked={!booster.off} onChange={(on) => onOff(!on)} />
        <button type="button" className={styles.remove} aria-label={`Remove ${name}`} onClick={onRemove}>
          ×
        </button>
      </div>
      {booster.bursts.length > 0 && (
        <ul className={styles.bursts}>
          {booster.bursts.map((burst) => (
            <li key={burst.ref} data-off={!burst.active || undefined}>
              <TypeIcon typeId={burst.charge} size={20} marker={false} />
              {sde.type(burst.charge)?.name}
              {!burst.active && <span className={styles.details}>offline</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function Switch({
  label,
  checked,
  onChange,
  children,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: string;
}) {
  return (
    <label className={styles.switch}>
      {children}
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function PasteForm({ onDone }: { onDone: () => void }) {
  const engine = useEngine();
  const store = useFitStore();
  const id = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  const add = () => {
    try {
      store.addBooster(engine.loadText(text, store.character));
      onDone();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return (
    <form
      className={browserStyles.form}
      onSubmit={(event) => {
        event.preventDefault();
        add();
      }}
    >
      <label htmlFor={id}>Paste a booster fit in EFT, DNA or esf/1 format. It flies with every skill at V.</label>
      <textarea
        id={id}
        rows={12}
        placeholder={"[Claymore, Shield Boosts]\nShield Command Burst II, Shield Harmonizing Charge\n…"}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError(undefined);
        }}
      />
      {error !== undefined && (
        <p className={browserStyles.importError} role="alert">
          Could not add: {error}
        </p>
      )}
      <div className={browserStyles.dialogButtons}>
        <button type="button" className={browserStyles.action} onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className={browserStyles.action} disabled={text.trim() === ""}>
          Add
        </button>
      </div>
    </form>
  );
}

function PickList({ onDone }: { onDone: () => void }) {
  const sde = useSde();
  const store = useFitStore();
  const local = useLocalFits().fits;
  const personal = usePersonalFits().fits;
  const boosting = [...local, ...personal].filter((fit) => burstsOf(sde, fit).length > 0);

  const pick = (fit: Fit) => {
    store.addBooster(fit);
    onDone();
  };

  if (boosting.length === 0) {
    return <p className={styles.pickEmpty}>None of your saved fits has a command burst with a charge loaded.</p>;
  }
  return (
    <ul className={styles.pick} aria-label="Fits with command bursts">
      {boosting.map((fit, index) => {
        const hull = sde.type(fit.ship.type_id)?.name ?? "Unknown hull";
        return (
          // oxlint-disable-next-line react/no-array-index-key -- Saved fits have no ID of their own.
          <li key={index}>
            <button type="button" onClick={() => pick(fit)}>
              <TypeIcon typeId={fit.ship.type_id} size={32} />
              <span className={styles.names}>
                <span className={styles.name}>{fit.name || hull}</span>
                <span className={styles.details}>{hull}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
