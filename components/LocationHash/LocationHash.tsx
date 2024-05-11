import { useEveShipFitHash, ShipSnapshotContext, useEveShipFitLinkHash, EveDataContext } from "@eveshipfit/react";
import React from "react";

export const LocationHash = () => {
  const eveData = React.useContext(EveDataContext);
  const snapshot = React.useContext(ShipSnapshotContext);
  const eveShipFitLinkHash = useEveShipFitLinkHash();
  const eveShipFitHash = useEveShipFitHash();

  const [requestedFit, setRequestedFit] = React.useState<string | undefined>(undefined);

  const analyzeHash = React.useCallback(async () => {
    const hash = window.location.hash;

    if (hash.startsWith("#fit:")) {
      const fitHash = hash.slice(1);
      setRequestedFit(fitHash);
    }
  }, []);

  React.useEffect(() => {
    async function run() {
      if (!eveData.loaded || requestedFit === undefined) return;

      const esiFit = await eveShipFitHash(requestedFit);
      setRequestedFit(undefined);

      if (esiFit !== undefined) {
        snapshot.changeFit(esiFit);
      }
    }

    run();
  }, [eveData, requestedFit, snapshot, eveShipFitHash]);

  React.useEffect(() => {
    analyzeHash();

    // We only want to analyze the hash on page-enter; never again after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (eveShipFitLinkHash === "") return;

    window.history.replaceState(null, "", window.location.pathname + window.location.search + eveShipFitLinkHash);
  }, [eveShipFitLinkHash]);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", async () => {
      await analyzeHash();
    });
  }

  return null;
}
