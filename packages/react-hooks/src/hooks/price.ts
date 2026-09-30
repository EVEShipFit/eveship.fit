import type { Esi, MarketPrice } from "@eveshipfit/esi";
import { fitPrice } from "@eveshipfit/fitting";
import { useEffect, useState } from "react";

import { useShownSnapshot } from "./fit.js";
import { useEngine } from "./sde.js";

/** The shown fit's estimated price in ISK; undefined without the engine's `esi`, or until its prices are in. */
export function useFitPrice(): number | undefined {
  const engine = useEngine();
  const { fit } = useShownSnapshot();
  const prices = useMarketPrices(engine.esi);
  return prices === undefined ? undefined : fitPrice(engine.sde, fit, prices);
}

function useMarketPrices(esi: Esi | undefined): ReadonlyMap<number, MarketPrice> | undefined {
  const [loaded, setLoaded] = useState<{ esi: Esi; prices: ReadonlyMap<number, MarketPrice> }>();

  useEffect(() => {
    if (esi === undefined) return;
    let current = true;
    esi.marketPrices().then(
      (prices) => {
        if (current) setLoaded({ esi, prices });
      },
      (error: unknown) => console.error(error),
    );
    return () => {
      current = false;
    };
  }, [esi]);

  return loaded !== undefined && loaded.esi === esi ? loaded.prices : undefined;
}
