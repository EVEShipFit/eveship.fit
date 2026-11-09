import type { Fit } from "@eveshipfit/fitting";
import { useEngine, useFitSaving, type FitSavingValue } from "@eveshipfit/react-hooks";
import { useId, useState, type ReactNode } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import styles from "./ItemBrowser.module.css";

const MAX_ESI_NAME = 50;

interface SaveCallbacks {
  /** The fit is about to be saved, with its final name. */
  onStart?: (fit: Fit) => void;
  onSaved?: () => void;
}

interface Job extends SaveCallbacks {
  fit: Fit;
}

type Asking =
  | { kind: "name"; job: Job }
  | { kind: "mutated"; job: Job; modules: readonly string[] }
  | { kind: "replace"; job: Job };

/** Saves a fit to where saves go, asking what it needs first; render `dialog` once. */
export function useSaveFit(): Pick<FitSavingValue, "characters" | "target" | "pick"> & {
  save: (fit: Fit, callbacks?: SaveCallbacks) => void;
  saving: boolean;
  dialog: ReactNode;
} {
  const engine = useEngine();
  const typeName = (typeId: number) => engine.sde.type(typeId)?.name ?? String(typeId);
  const { characters, target, fits, pick, save: saveToTarget } = useFitSaving();
  const [asking, setAsking] = useState<Asking>();
  const [notice, setNotice] = useState<string>();
  const [saving, setSaving] = useState(false);

  const finish = ({ fit, onStart, onSaved }: Job, replace = false) => {
    setAsking(undefined);
    onStart?.(fit);
    if (target === undefined) {
      void saveToTarget(fit);
      onSaved?.();
      return;
    }
    setSaving(true);
    saveToTarget(fit, replace)
      .then(
        () => onSaved?.(),
        (error: unknown) => {
          console.error(error);
          setNotice("EVE did not save this fit. Please try again.");
        },
      )
      .finally(() => setSaving(false));
  };

  const askReplace = (job: Job) => {
    const existing = fits.find((one) => one.ship.type_id === job.fit.ship.type_id && one.name === job.fit.name);
    if (existing === undefined) return finish(job);
    if (target === undefined) {
      if (JSON.stringify(existing) === JSON.stringify(job.fit)) return finish(job);
    } else if (JSON.stringify(engine.saveEsiFitting(existing)) === JSON.stringify(engine.saveEsiFitting(job.fit))) {
      setAsking(undefined);
      job.onStart?.(job.fit);
      job.onSaved?.();
      return;
    }
    setAsking({ kind: "replace", job });
  };

  const askMutated = (job: Job) => {
    const modules =
      target === undefined
        ? []
        : job.fit.items.flatMap(({ type_id, mutation }) =>
            mutation === undefined ? [] : [`${typeName(type_id)} → ${typeName(mutation.base)}`],
          );
    if (modules.length > 0) setAsking({ kind: "mutated", job, modules });
    else askReplace(job);
  };

  const save = (fit: Fit, callbacks?: SaveCallbacks) => {
    if (saving) return;
    if (target !== undefined && engine.saveEsiFitting(fit).items.length === 0) {
      setNotice("EVE can't save an empty hull. Fit a module first.");
      return;
    }
    const job = { fit, ...callbacks };
    if (!fit.name || (target !== undefined && fit.name.length > MAX_ESI_NAME)) setAsking({ kind: "name", job });
    else askMutated(job);
  };

  const close = () => setAsking(undefined);
  const name = asking?.job.fit.name;

  return {
    characters,
    target,
    pick,
    save,
    saving,
    dialog: (
      <>
        <Dialog open={asking?.kind === "name"} title="Save Fit" onClose={close}>
          {asking?.kind === "name" && (
            <NameForm
              fit={asking.job.fit}
              maxLength={target === undefined ? undefined : MAX_ESI_NAME}
              onCancel={close}
              onSave={(named) => askMutated({ ...asking.job, fit: named })}
            />
          )}
        </Dialog>
        <Dialog open={asking?.kind === "mutated"} title="Save to EVE?" onClose={close}>
          <Confirm
            text="EVE can't store mutated modules. These will be saved as the normal module:"
            list={asking?.kind === "mutated" ? asking.modules : undefined}
            action="Save anyway"
            onCancel={close}
            onConfirm={() => asking && askReplace(asking.job)}
          />
        </Dialog>
        <Dialog
          open={asking?.kind === "replace"}
          title={target === undefined ? "Overwrite Fit?" : "Replace Fit?"}
          onClose={close}
        >
          <Confirm
            text={
              target === undefined
                ? `A fit named "${name}" is already saved for this hull. Overwrite it?`
                : `${target.name} already has a fit named "${name}" for this hull. Replace it?`
            }
            action={target === undefined ? "Overwrite" : "Replace"}
            onCancel={close}
            onConfirm={() => asking && finish(asking.job, true)}
          />
        </Dialog>
        <Dialog open={notice !== undefined} title="Save to EVE" onClose={() => setNotice(undefined)}>
          <div className={styles.confirm}>
            <p>{notice}</p>
            <div className={styles.dialogButtons}>
              <button type="button" className={styles.action} onClick={() => setNotice(undefined)}>
                Close
              </button>
            </div>
          </div>
        </Dialog>
      </>
    ),
  };
}

function Confirm({
  text,
  list,
  action,
  onCancel,
  onConfirm,
}: {
  text: string;
  list?: readonly string[];
  action: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.confirm}>
      <p>{text}</p>
      {list !== undefined && (
        <ul>
          {list.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      <div className={styles.dialogButtons}>
        <button type="button" className={styles.action} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={styles.action} onClick={onConfirm}>
          {action}
        </button>
      </div>
    </div>
  );
}

function NameForm({
  fit,
  maxLength,
  onCancel,
  onSave,
}: {
  fit: Fit;
  maxLength: number | undefined;
  onCancel: () => void;
  onSave: (named: Fit) => void;
}) {
  const engine = useEngine();
  const id = useId();
  const [name, setName] = useState(() => fit.name || (engine.sde.type(fit.ship.type_id)?.name ?? ""));
  const trimmed = name.trim();
  const tooLong = maxLength !== undefined && trimmed.length > maxLength;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...fit, name: trimmed });
      }}
    >
      <label htmlFor={id}>Name this fit.</label>
      <input
        id={id}
        value={name}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setName(event.target.value)}
      />
      {tooLong && (
        <p className={styles.importError} role="alert">
          EVE allows {maxLength} characters at most.
        </p>
      )}
      <div className={styles.dialogButtons}>
        <button type="button" className={styles.action} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.action} disabled={trimmed === "" || tooLong}>
          Save
        </button>
      </div>
    </form>
  );
}
