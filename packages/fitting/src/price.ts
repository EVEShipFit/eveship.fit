import type { MarketPrice } from "@eveshipfit/esi";
import type { Sde } from "@eveshipfit/sde-loader";

import type { Fit } from "./types.js";

/** What a fit costs at ESI's average prices: its ship, items, and the charges filling its modules. */
export function fitPrice(sde: Sde, fit: Fit, prices: ReadonlyMap<number, MarketPrice>): number {
  const price = (typeId: number) => prices.get(typeId)?.average_price;

  let total = price(fit.ship.type_id) ?? 0;
  for (const item of fit.items) {
    if (item.slot.type === "implant" || item.slot.type === "booster") continue;

    const each = price(item.type_id) ?? (item.mutation === undefined ? undefined : price(item.mutation.base));
    total += (each ?? 0) * (item.quantity ?? 1);
    if (item.charge === undefined) continue;

    const capacity = sde.type(item.type_id)?.capacity ?? 0;
    const volume = sde.type(item.charge.type_id)?.volume ?? 0;
    if (volume > 0) total += (price(item.charge.type_id) ?? 0) * Math.floor((capacity / volume) * (1 + 1e-6));
  }
  return total;
}
