import type { Fit, TextFormat } from "@eveshipfit/fitting";
import { useEngine, useFit, useFitStore, useLocalFits } from "@eveshipfit/react-hooks";
import { useEffect, useId, useState } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { useCopyFit } from "./copyFit";
import styles from "./ItemBrowser.module.css";

const FLASH_MS = 2000;

interface Draft {
  text: string;
  error?: string;
}

/** The buttons under the `ItemBrowser`: save the fit in the browser, import one, or copy it out. */
export function FitActions({ noHullSelected, pasteToOpen }: { noHullSelected: boolean; pasteToOpen: boolean }) {
  const engine = useEngine();
  const fit = useFit();
  const store = useFitStore();
  const { fits, save } = useLocalFits();
  const menu = useId();
  const [saved, flashSaved] = useFlash();
  const [copied, flashCopied] = useFlash();
  const [importing, setImporting] = useState<Draft>();
  const [naming, setNaming] = useState(false);
  const [overwriting, setOverwriting] = useState<Fit>();
  const { copy: copyFit, dialog: copyDialog } = useCopyFit();

  const saveNow = (named: Fit) => {
    setOverwriting(undefined);
    store.setName(named.name ?? "");
    save(named);
    flashSaved();
  };

  const trySave = (named: Fit) => {
    const existing = fits.find((one) => one.ship.type_id === named.ship.type_id && one.name === named.name);
    if (existing === undefined || JSON.stringify(existing) === JSON.stringify(named)) saveNow(named);
    else setOverwriting(named);
  };

  useEffect(() => {
    if (!pasteToOpen) return;
    const onPaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.isContentEditable) return;
      if (target instanceof Element && target.closest("input, textarea, select, dialog")) return;
      const text = event.clipboardData?.getData("text/plain").trim() ?? "";
      if (text === "") return;
      event.preventDefault();
      try {
        store.replace(engine.loadText(text, store.character));
      } catch (failure) {
        setImporting({ text, error: failure instanceof Error ? failure.message : String(failure) });
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [engine, store, pasteToOpen]);

  const copy = (format: TextFormat) => {
    document.getElementById(menu)?.hidePopover();
    copyFit(fit, format, flashCopied);
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.action}
        disabled={noHullSelected}
        onClick={() => (fit.name ? trySave(fit) : setNaming(true))}
      >
        {saved ? "Saved" : "Save"}
      </button>
      <button type="button" className={styles.action} onClick={() => setImporting({ text: "" })}>
        Import…
      </button>
      <span className={styles.copyAnchor}>
        <Tooltip label={copied ? "Copied" : "Copy"}>
          <button
            type="button"
            className={`${styles.action} ${styles.copy}`}
            aria-label="Copy"
            popoverTarget={menu}
            disabled={noHullSelected}
          >
            <Icon name={copied ? "checkmark" : "export"} />
          </button>
        </Tooltip>
      </span>
      <div id={menu} className={styles.menu} popover="auto" role="menu">
        <button type="button" role="menuitem" onClick={() => copy("eft")}>
          Copy as EFT
        </button>
        <button type="button" role="menuitem" onClick={() => copy("esf")}>
          Copy as esf/1
        </button>
      </div>
      <Dialog open={naming} title="Save Fit" onClose={() => setNaming(false)}>
        <NameForm
          onCancel={() => setNaming(false)}
          onSave={(named) => {
            setNaming(false);
            trySave(named);
          }}
        />
      </Dialog>
      <Dialog open={overwriting !== undefined} title="Overwrite Fit?" onClose={() => setOverwriting(undefined)}>
        <div className={styles.confirm}>
          <p>A fit named &quot;{overwriting?.name}&quot; is already saved for this hull. Overwrite it?</p>
          <div className={styles.dialogButtons}>
            <button type="button" className={styles.action} onClick={() => setOverwriting(undefined)}>
              Cancel
            </button>
            <button type="button" className={styles.action} onClick={() => overwriting && saveNow(overwriting)}>
              Overwrite
            </button>
          </div>
        </div>
      </Dialog>
      <Dialog open={importing !== undefined} title="Import Fit" onClose={() => setImporting(undefined)}>
        <ImportForm draft={importing ?? { text: "" }} onDone={() => setImporting(undefined)} />
      </Dialog>
      {copyDialog}
    </div>
  );
}

function NameForm({ onCancel, onSave }: { onCancel: () => void; onSave: (named: Fit) => void }) {
  const engine = useEngine();
  const fit = useFit();
  const id = useId();
  const [name, setName] = useState(() => engine.sde.type(fit.ship.type_id)?.name ?? "");

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...fit, name: name.trim() });
      }}
    >
      <label htmlFor={id}>Name this fit.</label>
      <input
        id={id}
        value={name}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setName(event.target.value)}
      />
      <div className={styles.dialogButtons}>
        <button type="button" className={styles.action} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.action} disabled={name.trim() === ""}>
          Save
        </button>
      </div>
    </form>
  );
}

function ImportForm({ draft, onDone }: { draft: Draft; onDone: () => void }) {
  const engine = useEngine();
  const store = useFitStore();
  const id = useId();
  const [text, setText] = useState(draft.text);
  const [error, setError] = useState(draft.error);

  useEffect(() => {
    if (draft.text !== "") return;
    Promise.resolve()
      .then(() => navigator.clipboard.readText())
      .then(
        (clipboard) => setText((typed) => typed || clipboard),
        () => {},
      );
  }, [draft.text]);

  const load = () => {
    try {
      store.replace(engine.loadText(text, store.character));
      onDone();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        load();
      }}
    >
      <label htmlFor={id}>Paste a fit in EFT, DNA or esf/1 format.</label>
      <textarea
        id={id}
        rows={12}
        placeholder={"[Rifter, My Rifter]\nDamage Control II\n…"}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError(undefined);
        }}
      />
      {error !== undefined && (
        <p className={styles.importError} role="alert">
          Could not import: {error}
        </p>
      )}
      <div className={styles.dialogButtons}>
        <button type="button" className={styles.action} onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className={styles.action} disabled={text.trim() === ""}>
          Import
        </button>
      </div>
    </form>
  );
}

function useFlash(): [boolean, () => void] {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown === 0) return;
    const timer = setTimeout(() => setShown(0), FLASH_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  return [shown > 0, () => setShown(Date.now())];
}
