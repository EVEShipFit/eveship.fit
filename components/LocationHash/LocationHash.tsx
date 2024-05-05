import { type EsiFit, eveShipFitHash, ShipSnapshotContext } from "@eveshipfit/react";
import React from "react";

async function analyzeHash(changeFit: (fit: EsiFit) => void) {
  const hash = window.location.hash;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  if (hash.startsWith("#fit:")) {
    const fitHash = hash.slice(1);
    const esiFit = await eveShipFitHash(fitHash);
    if (esiFit !== undefined) {
      changeFit(esiFit);
    }
  }
}

export const LocationHash = () => {
  const snapshot = React.useContext(ShipSnapshotContext);

  React.useEffect(() => {
    analyzeHash(snapshot.changeFit);

    // We only want to analyze the hash on page-enter; never again after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", async () => {
      await analyzeHash(snapshot.changeFit);
    });
  }

  return null;
}
