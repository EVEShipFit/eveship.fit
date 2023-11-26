import React from "react";

import { useFormatEftToEsi } from "@eveshipfit/react";
import type { EsiFit } from "@eveshipfit/react";

import styles from "./Debug.module.css";

const useFormatEsi = () => {
  return (esi: string): EsiFit | undefined => {
    if (!esi.startsWith("{")) return undefined;
    return JSON.parse(esi);
  }
};

export const Debug = ({ fit, setFit }: { fit: EsiFit, setFit: (fit: EsiFit) => void }) => {
  const [fitText, setFitText] = React.useState<string>(JSON.stringify(fit, null, 2));
  const [error, setError] = React.useState<string>("");

  const formatEsi = useFormatEsi();
  const formatEft = useFormatEftToEsi();

  function formatFit() {
    let esiFit;
    try {
      esiFit = formatEsi(fitText) || formatEft(fitText);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
      return;
    }

    if (esiFit === undefined) {
      setError("String doesn't appear to be either an ESI or an EFT fit.");
      return;
    }

    setFit(esiFit);
    setError("");
  }

  return <div className={styles.debug}>
    Still tool is still a work in progress; this textarea allows you, for the time being, to easily import ESI or EFT fits.<br />
    <textarea className={styles.debugTextArea} value={fitText} onChange={(e) => setFitText(e.target.value)} />
    <button className={styles.debugButton} onClick={() => formatFit()}>Load Fit</button>
    <div className={styles.debugError}>{error}</div>
  </div>
}
