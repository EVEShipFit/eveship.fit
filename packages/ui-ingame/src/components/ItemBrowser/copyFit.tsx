import type { Fit, TextFormat } from "@eveshipfit/fitting";
import { useEngine } from "@eveshipfit/react-hooks";
import { useEffect, useId, useState, type ReactNode } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import styles from "./ItemBrowser.module.css";

const FLASH_MS = 2000;

/** Copies a fit to the clipboard, or shows it in `dialog` when the browser refuses; render `dialog` once. */
export function useCopyFit(): {
  copy: (fit: Fit, format: TextFormat, onCopied?: () => void) => void;
  dialog: ReactNode;
} {
  const engine = useEngine();
  const { copy, dialog } = useCopyText("Copy Fit", "fit", 12);

  return { copy: (fit, format, onCopied) => copy(engine.saveText(fit, format), onCopied), dialog };
}

/** Copies text to the clipboard, or shows it in `dialog` when the browser refuses; render `dialog` once. */
export function useCopyText(
  title: string,
  what: string,
  rows: number,
): { copy: (text: string, onCopied?: () => void) => void; dialog: ReactNode } {
  const [refused, setRefused] = useState<string>();

  const copy = (text: string, onCopied?: () => void) => {
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(text))
      .then(onCopied, () => setRefused(text));
  };

  return {
    copy,
    dialog: (
      <Dialog open={refused !== undefined} title={title} onClose={() => setRefused(undefined)}>
        <CopyForm text={refused ?? ""} what={what} rows={rows} />
      </Dialog>
    ),
  };
}

/** `true` for a moment after calling the returned function. */
export function useFlash(): [boolean, () => void] {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown === 0) return;
    const timer = setTimeout(() => setShown(0), FLASH_MS);
    return () => clearTimeout(timer);
  }, [shown]);

  return [shown > 0, () => setShown(Date.now())];
}

function CopyForm({ text, what, rows }: { text: string; what: string; rows: number }) {
  const id = useId();

  return (
    <div className={styles.form}>
      <label htmlFor={id}>The browser blocked the clipboard. Copy the {what} from here.</label>
      <textarea id={id} rows={rows} readOnly value={text} onFocus={(event) => event.currentTarget.select()} />
    </div>
  );
}
