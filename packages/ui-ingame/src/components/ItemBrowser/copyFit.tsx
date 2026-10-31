import type { Fit, TextFormat } from "@eveshipfit/fitting";
import { useEngine } from "@eveshipfit/react-hooks";
import { useId, useState, type ReactNode } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import styles from "./ItemBrowser.module.css";

/** Copies a fit to the clipboard, or shows it in `dialog` when the browser refuses; render `dialog` once. */
export function useCopyFit(): {
  copy: (fit: Fit, format: TextFormat, onCopied?: () => void) => void;
  dialog: ReactNode;
} {
  const engine = useEngine();
  const [refused, setRefused] = useState<string>();

  const copy = (fit: Fit, format: TextFormat, onCopied?: () => void) => {
    const text = engine.saveText(fit, format);
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(text))
      .then(onCopied, () => setRefused(text));
  };

  return {
    copy,
    dialog: (
      <Dialog open={refused !== undefined} title="Copy Fit" onClose={() => setRefused(undefined)}>
        <CopyForm text={refused ?? ""} />
      </Dialog>
    ),
  };
}

function CopyForm({ text }: { text: string }) {
  const id = useId();

  return (
    <div className={styles.form}>
      <label htmlFor={id}>The browser blocked the clipboard. Copy the fit from here.</label>
      <textarea id={id} rows={12} readOnly value={text} onFocus={(event) => event.currentTarget.select()} />
    </div>
  );
}
