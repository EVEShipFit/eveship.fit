import type { Sde } from "@eveshipfit/sde-loader";

import type { Fit } from "./types.js";

/** What a fit costs: its ship, items, and the charges filling its modules, at the price of each type. */
export function fitPrice(sde: Sde, fit: Fit, price: (typeId: number) => number | undefined): number {
  let total = price(fit.ship.type_id) ?? 0;
  for (const item of fit.items) {
    if (item.slot.type === "implant" || item.slot.type === "booster") continue;

    total += (price(item.mutation?.base ?? item.type_id) ?? 0) * (item.quantity ?? 1);
    if (item.charge === undefined) continue;

    const capacity = sde.type(item.type_id)?.capacity ?? 0;
    const volume = sde.type(item.charge.type_id)?.volume ?? 0;
    if (volume > 0) total += (price(item.charge.type_id) ?? 0) * Math.floor((capacity / volume) * (1 + 1e-6));
  }
  return total;
}
