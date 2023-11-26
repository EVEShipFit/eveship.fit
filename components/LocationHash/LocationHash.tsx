import { type EsiFit, eveShipFitHash } from "@eveshipfit/react";
import React from "react";

async function analyzeHash(setFit: (fit: EsiFit) => void) {
  const hash = window.location.hash;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  if (hash.startsWith("#fit:")) {
    const fitHash = hash.slice(1);
    const esiFit = await eveShipFitHash(fitHash);
    if (esiFit) {
      setFit(esiFit);
    }
  }
}

export const LocationHash = ({ setFit }: { setFit: (fit: EsiFit) => void }) => {
  React.useEffect(() => {
    analyzeHash(setFit);

    // We only want to analyze the hash on page-enter; never again after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", async () => {
      await analyzeHash(setFit);
    });
  }

  return null;
}
