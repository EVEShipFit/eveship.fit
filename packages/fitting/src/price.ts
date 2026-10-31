import type { Sde } from "@eveshipfit/sde-loader";

import type { Fit } from "./types.js";

/** One type in a fit's price, with how many of it the fit has. */
export interface FitPriceItem {
  readonly typeId: number;
  readonly quantity: number;
  /** In ISK, for one; undefined without a price. */
  readonly price: number | undefined;
}

/** What a fit costs: its ship, items, and the charges filling its modules, at the price of each type. */
export function fitPrice(sde: Sde, fit: Fit, price: (typeId: number) => number | undefined): number {
  return fitPriceItems(sde, fit, price).reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);
}

/** What `fitPrice()` adds up, one entry per type; most expensive first, unpriced last. */
export function fitPriceItems(
  sde: Sde,
  fit: Fit,
  price: (typeId: number) => number | undefined,
): readonly FitPriceItem[] {
  const quantities = new Map<number, number>([[fit.ship.type_id, 1]]);
  const add = (typeId: number, quantity: number) => {
    if (quantity > 0) quantities.set(typeId, (quantities.get(typeId) ?? 0) + quantity);
  };

  for (const item of fit.items) {
    if (item.slot.type === "implant" || item.slot.type === "booster") continue;

    add(item.mutation?.base ?? item.type_id, item.quantity ?? 1);
    if (item.charge === undefined) continue;

    const capacity = sde.type(item.type_id)?.capacity ?? 0;
    const volume = sde.type(item.charge.type_id)?.volume ?? 0;
    if (volume > 0) add(item.charge.type_id, Math.floor((capacity / volume) * (1 + 1e-6)));
  }

  const items = [...quantities].map(([typeId, quantity]) => ({ typeId, quantity, price: price(typeId) }));
  return items.toSorted((a, b) => itemTotal(b) - itemTotal(a));
}

function itemTotal(item: FitPriceItem): number {
  return item.price === undefined ? -1 : item.price * item.quantity;
}
