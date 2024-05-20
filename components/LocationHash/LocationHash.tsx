import React from "react";

import { useEveData, useExportEveShipFitHash, useFitManager, useImportEveShipFitHash } from "@eveshipfit/react";

export const LocationHash = () => {
  const eveData = useEveData();
  const fitManager = useFitManager();
  const importEveShipFitHash = useImportEveShipFitHash();
  const eveShipFitHash = useExportEveShipFitHash(true);

  const [requestedFit, setRequestedFit] = React.useState<string | undefined>(undefined);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const setFit = fitManager.setFit;

  const analyzeHash = React.useCallback(async () => {
    const hash = window.location.hash;

    if (hash.startsWith("#fit:")) {
      const fitHash = hash.slice(1);
      setRequestedFit(fitHash);
    }
  }, []);

  React.useEffect(() => {
    async function run() {
      if (eveData === null || requestedFit === undefined) return;
      setRequestedFit(undefined);

      const fit = await importEveShipFitHash(requestedFit);

      if (fit !== undefined && fit !== null) {
        setFit(fit);
      }
    }

    run();
  }, [eveData, requestedFit, setFit, importEveShipFitHash]);

  if (firstLoad) {
    setFirstLoad(false);
    analyzeHash();
  }

  React.useEffect(() => {
    if (eveShipFitHash === null) return;

    window.history.replaceState(null, "", window.location.pathname + window.location.search + eveShipFitHash);
  }, [eveShipFitHash]);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", async () => {
      await analyzeHash();
    });
  }

  return null;
};
