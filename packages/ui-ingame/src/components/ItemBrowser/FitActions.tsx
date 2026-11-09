import { parseItemLink, parseMutationText, type Engine, type FitStore, type TextFormat } from "@eveshipfit/fitting";
import { canSaveFits, useCharacters, useEngine, useFit, useFitStore, type EsiCharacter } from "@eveshipfit/react-hooks";
import { useEffect, useId, useState } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { useCopyFit, useFlash } from "./copyFit";
import styles from "./ItemBrowser.module.css";
import { useSaveFit } from "./saveFit";

interface Draft {
  text: string;
  error?: string;
}

/** The buttons under the `ItemBrowser`: save the fit in the browser, import one, or copy it out. */
export function FitActions({ noHullSelected, pasteToOpen }: { noHullSelected: boolean; pasteToOpen: boolean }) {
  const engine = useEngine();
  const fit = useFit();
  const store = useFitStore();
  const menu = useId();
  const [saved, flashSaved] = useFlash();
  const [copied, flashCopied] = useFlash();
  const [importing, setImporting] = useState<Draft>();
  const { copy: copyFit, dialog: copyDialog } = useCopyFit();

  const saver = useSaveFit();
  const [savedTo, setSavedTo] = useState("");
  const saveCurrent = () => {
    const where = saver.target?.name ?? "browser";
    saver.save(fit, {
      onStart: (named) => store.setName(named.name ?? ""),
      onSaved: () => {
        setSavedTo(where);
        flashSaved();
      },
    });
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
      const pasted = noHullSelected ? undefined : parseMutationText(engine.sde, text);
      if (pasted !== undefined) {
        if (store.fitMutated(pasted) === undefined)
          setImporting({ text, error: "This module does not fit on the ship" });
        return;
      }
      const item = engine.esi === undefined || noHullSelected ? undefined : parseItemLink(text);
      if (item !== undefined) {
        void fitMutated(engine, store, item.typeId, item.itemId).catch((failure: unknown) =>
          setImporting({ text, error: failure instanceof Error ? failure.message : String(failure) }),
        );
        return;
      }
      try {
        store.replace(engine.loadText(text, store.character));
      } catch (failure) {
        setImporting({ text, error: failure instanceof Error ? failure.message : String(failure) });
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [engine, store, pasteToOpen, noHullSelected]);

  const copy = (format: TextFormat) => {
    document.getElementById(menu)?.hidePopover();
    copyFit(fit, format, flashCopied);
  };

  return (
    <div className={styles.actions}>
      {saver.characters === undefined ? (
        <button type="button" className={styles.action} disabled={noHullSelected} onClick={saveCurrent}>
          {saved ? "Saved" : "Save"}
        </button>
      ) : (
        <SaveSplit saver={saver} savedTo={saved ? savedTo : undefined} disabled={noHullSelected} onSave={saveCurrent} />
      )}
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
      <Dialog open={importing !== undefined} title="Import Fit" onClose={() => setImporting(undefined)}>
        <ImportForm draft={importing ?? { text: "" }} onDone={() => setImporting(undefined)} />
      </Dialog>
      {copyDialog}
      {saver.dialog}
    </div>
  );
}

function SaveSplit({
  saver: { characters, target, pick, saving },
  savedTo,
  disabled,
  onSave,
}: {
  saver: ReturnType<typeof useSaveFit>;
  savedTo: string | undefined;
  disabled: boolean;
  onSave: () => void;
}) {
  const menu = useId();
  const { current, login } = useCharacters();
  const where = target?.name ?? "browser";
  const close = () => document.getElementById(menu)?.hidePopover();
  const choose = (owner: "browser" | number) => {
    pick(owner);
    close();
  };
  const logIn = (canSave: boolean) => {
    close();
    login?.(canSave);
  };
  const row = (character: EsiCharacter) => {
    const writable = canSaveFits(character);
    return (
      <button
        key={character.id}
        type="button"
        role={writable ? "menuitemradio" : "menuitem"}
        aria-checked={writable ? character.id === target?.id : undefined}
        data-off={!writable || undefined}
        onClick={
          writable ? () => choose(character.id) : () => logIn(character.status !== "expired" || character.canWriteFits)
        }
      >
        <span className={styles.tick}>{character.id === target?.id && "✓"}</span>
        <Icon name="fits-personal" />
        <span className={styles.saveName}>{character.name}</span>
        {!writable && (
          <span className={styles.saveUpgrade}>{character.status === "expired" ? "Log in again" : "Allow saving"}</span>
        )}
        {writable && String(character.id) === current && <span className={styles.saveNote}>flying now</span>}
      </button>
    );
  };

  return (
    <>
      <span className={styles.saveAnchor}>
        <button
          type="button"
          className={`${styles.action} ${styles.saveMain}`}
          disabled={disabled}
          aria-disabled={saving || undefined}
          onClick={onSave}
        >
          <Icon name={target === undefined ? "fits-browser" : "fits-personal"} />
          <span className={styles.saveName}>
            {savedTo === undefined ? `Save to ${where}` : `Saved to ${savedTo} ✓`}
          </span>
        </button>
        <button
          type="button"
          className={`${styles.action} ${styles.saveArrow}`}
          aria-label="Where to save"
          popoverTarget={menu}
        />
      </span>
      <div id={menu} className={`${styles.menu} ${styles.saveMenu}`} popover="auto" role="menu">
        <button
          type="button"
          role="menuitemradio"
          aria-checked={target === undefined}
          onClick={() => choose("browser")}
        >
          <span className={styles.tick}>{target === undefined && "✓"}</span>
          <Icon name="fits-browser" />
          This browser
        </button>
        <hr className={styles.menuRule} />
        {characters?.map(row)}
        {characters?.length === 0 && login && (
          <button type="button" role="menuitem" onClick={() => logIn(true)}>
            <span className={styles.tick} />
            <span className={styles.saveUpgrade}>Log in and allow saving</span>
          </button>
        )}
      </div>
    </>
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

/** Fits a mutated item from the game in the first free slot of its rack, rolled as it is. */
async function fitMutated(engine: Engine, store: FitStore, typeId: number, itemId: number) {
  const roll = await engine.loadMutation(typeId, itemId);
  if (store.fitMutated(roll) === undefined) throw new Error("This item does not fit on the ship");
}
