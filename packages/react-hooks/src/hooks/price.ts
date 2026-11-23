import { fitPriceItems, type FitPriceItem } from "@eveshipfit/fitting";
import type { ZKillboard } from "@eveshipfit/zkillboard";
import { useContext, useEffect, useState } from "react";

import { ZKillboardContext } from "../context.js";
import { useShownSnapshot, useSnapshot } from "./fit.js";
import { useEngine } from "./sde.js";

const RETRY = 60_000;
const DAY = 86_400_000;

export interface FitPriceValue {
  /** In ISK; undefined without the provider's `zkillboard`, or until its prices are in. */
  readonly value: number | undefined;
  /** How a preview would change the price, if it would; cheaper is better. */
  readonly change: "better" | "worse" | undefined;
  /** What `value` adds up; undefined like `value`. */
  readonly items: readonly FitPriceItem[] | undefined;
}

/** The shown fit's estimated price, at zKillboard's prices. */
export function useFitPrice(): FitPriceValue {
  const engine = useEngine();
  const shown = useShownSnapshot();
  const current = useSnapshot();
  const prices = usePrices();

  if (prices === undefined) return { value: undefined, change: undefined, items: undefined };
  const priceOf = (typeId: number) => prices.get(typeId);
  const currentItems = fitPriceItems(engine.sde, current.fit, priceOf);
  const items = shown === current ? currentItems : fitPriceItems(engine.sde, shown.fit, priceOf);
  const value = totalPrice(items);
  const before = totalPrice(currentItems);
  const unpriced = new Set(currentItems.filter((item) => item.price === undefined).map((item) => item.typeId));
  const guessed = items.some((item) => item.price === undefined && !unpriced.has(item.typeId));
  if (guessed || before === value) return { value, change: undefined, items };
  return { value, change: value < before ? "better" : "worse", items };
}

/** A type's price in ISK at zKillboard's prices; undefined until they are in, or when it has none. */
export function useTypePrice(typeId: number): number | undefined {
  return usePrices()?.get(typeId);
}

function totalPrice(items: readonly FitPriceItem[]): number {
  return items.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);
}

function usePrices(): ReadonlyMap<number, number> | undefined {
  const zkillboard = useContext(ZKillboardContext);
  const [loaded, setLoaded] = useState<{ zkillboard: ZKillboard; prices: ReadonlyMap<number, number> }>();

  useEffect(() => {
    if (zkillboard === undefined) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      zkillboard.prices().then(
        (prices) => {
          if (!active) return;
          setLoaded({ zkillboard, prices });
          timer = setTimeout(load, DAY - (Date.now() % DAY));
        },
        (error: unknown) => {
          console.error(error);
          if (active) timer = setTimeout(load, RETRY);
        },
      );
    };
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [zkillboard]);

  return loaded !== undefined && loaded.zkillboard === zkillboard ? loaded.prices : undefined;
}
