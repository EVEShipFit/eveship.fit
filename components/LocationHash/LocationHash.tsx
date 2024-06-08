import React from "react";

import { useEveData, useExportEveShipFit, useFitManager, useImportEveShipFit } from "@eveshipfit/react";

export const LocationHash = () => {
  const eveData = useEveData();
  const fitManager = useFitManager();
  const importEveShipFit = useImportEveShipFit();
  const encodedESF = useExportEveShipFit(false);

  const [requestedFit, setRequestedFit] = React.useState<string | undefined>(undefined);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const setFit = fitManager.setFit;

  const analyzeHash = React.useCallback(async () => {
    const oldHash = window.location.hash;
    if (oldHash.startsWith("#fit:")) {
      const fitHash = oldHash.slice(5);
      setRequestedFit(fitHash);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get("fit");
    if (hash !== null && hash.length > 1) {
      setRequestedFit(hash);
    }
  }, []);

  React.useEffect(() => {
    async function run() {
      if (eveData === null || requestedFit === undefined) return;
      setRequestedFit(undefined);

      const fit = await importEveShipFit(requestedFit);

      if (fit !== undefined && fit !== null) {
        setFit(fit);
      }
    }

    run();
  }, [eveData, requestedFit, setFit, importEveShipFit]);

  if (firstLoad) {
    setFirstLoad(false);
    analyzeHash();
  }

  React.useEffect(() => {
    if (encodedESF === null) return;

    window.history.replaceState(null, "", `${window.location.pathname}?fit=${encodedESF}`);
  }, [encodedESF]);

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", async () => {
      await analyzeHash();
    });
  }

  return null;
};
