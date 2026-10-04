import type { TextFormat } from "@eveshipfit/fitting";
import { useEngine, useFit, useFitStore, useLocalFits } from "@eveshipfit/react-hooks";
import { useEffect, useId, useState } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import styles from "./ItemBrowser.module.css";

const FLASH_MS = 2000;

/** The buttons under the `ItemBrowser`: save the fit in the browser, import one, or copy it out. */
export function FitActions() {
  const engine = useEngine();
  const fit = useFit();
  const { save } = useLocalFits();
  const menu = useId();
  const [saved, flashSaved] = useFlash();
  const [copied, flashCopied] = useFlash();
  const [importing, setImporting] = useState(false);

  const copy = (format: TextFormat) => {
    document.getElementById(menu)?.hidePopover();
    void navigator.clipboard.writeText(engine.saveText(fit, format)).then(flashCopied);
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.action}
        onClick={() => {
          save(fit);
          flashSaved();
        }}
      >
        {saved ? "Saved" : "Save"}
      </button>
      <button type="button" className={styles.action} onClick={() => setImporting(true)}>
        Import…
      </button>
      <span className={styles.copyAnchor}>
        <Tooltip label={copied ? "Copied" : "Copy"}>
          <button type="button" className={`${styles.action} ${styles.copy}`} aria-label="Copy" popoverTarget={menu}>
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
      <Dialog open={importing} title="Import Fit" onClose={() => setImporting(false)}>
        <ImportForm onDone={() => setImporting(false)} />
      </Dialog>
    </div>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const engine = useEngine();
  const store = useFitStore();
  const id = useId();
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    navigator.clipboard.readText().then(
      (clipboard) => setText((typed) => typed || clipboard),
      () => {},
    );
  }, []);

  const load = () => {
    try {
      store.replace(engine.loadText(text));
      onDone();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return (
    <form
      className={styles.import}
      onSubmit={(event) => {
        event.preventDefault();
        load();
      }}
    >
      <label htmlFor={id}>Paste a fit in EFT or esf/1 format.</label>
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
      <div className={styles.importButtons}>
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
