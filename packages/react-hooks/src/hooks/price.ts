import type { Esi, MarketPrice } from "@eveshipfit/esi";
import { fitPriceItems, type Fit, type FitPriceItem } from "@eveshipfit/fitting";
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
  /** What `value` adds up; undefined like `value`. */
  readonly items: readonly FitPriceItem[] | undefined;
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
        (error: unknown) => console.error(error),
      );
    }
  }, [zkillboard, unpriced]);

  if (priced === undefined) return { value: undefined, change: undefined, items: undefined };
  const { value, before, guessed, items } = priced;
  if (guessed || before === value) return { value, change: undefined, items };
  return { value, change: value < before ? "better" : "worse", items };
}

const noPrices: ZKillboardPrices = new Map();

/** A type's estimated price in ISK, priced like the fit; undefined until known. */
export function useTypePrice(typeId: number): number | undefined {
  const engine = useEngine();
  const prices = useMarketPrices(engine.esi);
  const zkillboard = useContext(ZKillboardContext);
  const [asked, setAsked] = useState<{ zkillboard: ZKillboard; typeId: number; price: number | undefined }>();

  const esi = esiPrice(prices?.get(typeId));
  const ask = prices !== undefined && esi === undefined ? zkillboard : undefined;

  useEffect(() => {
    if (ask === undefined) return;
    let active = true;
    ask.price(typeId).then(
      (price) => {
        if (active) setAsked({ zkillboard: ask, typeId, price });
      },
      (error: unknown) => console.error(error),
    );
    return () => {
      active = false;
    };
  }, [ask, typeId]);

  if (esi !== undefined) return esi;
  return asked?.zkillboard === ask && asked?.typeId === typeId ? asked.price : undefined;
}

/** Prices both fits; `unpriced` is what they have that only zKillboard could price. */
function priceFits(
  sde: Sde,
  shown: Fit,
  current: Fit,
  prices: ReadonlyMap<number, MarketPrice>,
  zkillboardPrices: ZKillboardPrices,
) {
  const unpriced = new Set<number>();
  const priceOf = (typeId: number) => {
    const price = esiPrice(prices.get(typeId)) ?? zkillboardPrices.get(typeId);
    if (price === undefined && !zkillboardPrices.has(typeId)) unpriced.add(typeId);
    return price;
  };
  const currentItems = fitPriceItems(sde, current, priceOf);
  const known = unpriced.size;
  const items = shown === current ? currentItems : fitPriceItems(sde, shown, priceOf);
  const guessed = unpriced.size > known;
  const value = totalPrice(items);
  const before = totalPrice(currentItems);
  return { value, before, guessed, items, unpriced: [...unpriced].toSorted((a, b) => a - b) };
}

function totalPrice(items: readonly FitPriceItem[]): number {
  return items.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);
}

function esiPrice(market: MarketPrice | undefined): number | undefined {
  return market?.average_price || market?.adjusted_price || undefined;
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
