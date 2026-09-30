import type { Esi, MarketPrice } from "@eveshipfit/esi";
import { fitPrice } from "@eveshipfit/fitting";
import { useEffect, useState } from "react";

import { useShownSnapshot, useSnapshot } from "./fit.js";
import { useEngine } from "./sde.js";

export interface FitPriceValue {
  /** In ISK; undefined without the engine's `esi`, or until its prices are in. */
  readonly value: number | undefined;
  /** How a preview would change the price, if it would; cheaper is better. */
  readonly change: "better" | "worse" | undefined;
}

/** The shown fit's estimated price. */
export function useFitPrice(): FitPriceValue {
  const engine = useEngine();
  const shown = useShownSnapshot();
  const current = useSnapshot();
  const prices = useMarketPrices(engine.esi);
  if (prices === undefined) return { value: undefined, change: undefined };

  const value = fitPrice(engine.sde, shown.fit, prices);
  const before = shown === current ? value : fitPrice(engine.sde, current.fit, prices);
  if (before === value) return { value, change: undefined };
  return { value, change: value < before ? "better" : "worse" };
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
