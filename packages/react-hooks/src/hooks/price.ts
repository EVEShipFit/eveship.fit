import type { Esi, MarketPrice } from "@eveshipfit/esi";
import { fitPrice, type Fit } from "@eveshipfit/fitting";
import type { Sde } from "@eveshipfit/sde-loader";
import type { ZKillboard } from "@eveshipfit/zkillboard";
import { useContext, useEffect, useState } from "react";

import { ZKillboardContext } from "../context.js";
import { useShownSnapshot, useSnapshot } from "./fit.js";
import { useEngine } from "./sde.js";

export interface FitPriceValue {
  /** In ISK; undefined without the engine's `esi`, or until its prices are in. */
  readonly value: number | undefined;
  /** How a preview would change the price, if it would; cheaper is better. */
  readonly change: "better" | "worse" | undefined;
}

type ZKillboardPrices = ReadonlyMap<number, number | undefined>;

/** The shown fit's estimated price: ESI's average price, else its adjusted price, else zKillboard's. */
export function useFitPrice(): FitPriceValue {
  const engine = useEngine();
  const shown = useShownSnapshot();
  const current = useSnapshot();
  const prices = useMarketPrices(engine.esi);
  const zkillboard = useContext(ZKillboardContext);
  const [asked, setAsked] = useState<{ zkillboard: ZKillboard; prices: ZKillboardPrices }>();
  const zkillboardPrices = asked !== undefined && asked.zkillboard === zkillboard ? asked.prices : noPrices;

  const priced = prices && priceFits(engine.sde, shown.fit, current.fit, prices, zkillboardPrices);
  const unpriced = priced?.unpriced.join(",") ?? "";

  useEffect(() => {
    if (zkillboard === undefined || unpriced === "") return;
    const found = (typeId: number, price: number | undefined) =>
      setAsked((known) => {
        const kept = known?.zkillboard === zkillboard ? known.prices : noPrices;
        return { zkillboard, prices: new Map(kept).set(typeId, price) };
      });
    for (const typeId of unpriced.split(",").map(Number)) {
      zkillboard.price(typeId).then(
        (price) => found(typeId, price),
        (error: unknown) => {
          console.error(error);
          found(typeId, undefined);
        },
      );
    }
  }, [zkillboard, unpriced]);

  if (priced === undefined) return { value: undefined, change: undefined };
  const { value, before } = priced;
  if (before === value) return { value, change: undefined };
  return { value, change: value < before ? "better" : "worse" };
}

const noPrices: ZKillboardPrices = new Map();

/** Prices both fits; `unpriced` is what the current fit has that only zKillboard could price. */
function priceFits(
  sde: Sde,
  shown: Fit,
  current: Fit,
  prices: ReadonlyMap<number, MarketPrice>,
  zkillboardPrices: ZKillboardPrices,
) {
  const unpriced = new Set<number>();
  const priceOf = (typeId: number) => {
    const market = prices.get(typeId);
    return market?.average_price || market?.adjusted_price || zkillboardPrices.get(typeId);
  };
  const before = fitPrice(sde, current, (typeId) => {
    const price = priceOf(typeId);
    if (price === undefined && !zkillboardPrices.has(typeId)) unpriced.add(typeId);
    return price;
  });
  const value = shown === current ? before : fitPrice(sde, shown, priceOf);
  return { value, before, unpriced: [...unpriced].toSorted((a, b) => a - b) };
}

function useMarketPrices(esi: Esi | undefined): ReadonlyMap<number, MarketPrice> | undefined {
  const [loaded, setLoaded] = useState<{ esi: Esi; prices: ReadonlyMap<number, MarketPrice> }>();

  useEffect(() => {
    if (esi === undefined) return;
    let active = true;
    esi.marketPrices().then(
      (prices) => {
        if (active) setLoaded({ esi, prices });
      },
      (error: unknown) => console.error(error),
    );
    return () => {
      active = false;
    };
  }, [esi]);

  return loaded !== undefined && loaded.esi === esi ? loaded.prices : undefined;
}
