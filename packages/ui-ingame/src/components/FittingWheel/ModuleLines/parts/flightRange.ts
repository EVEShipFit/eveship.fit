import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { range } from "../../../ShipStatistics/units";

/** How far the loaded missile flies, like "46 km". */
export function useFlightRange(itemRef: ItemRef): string | undefined {
  const velocity = useAttribute("maxVelocity", { of: itemRef, charge: true }).value;
  const flightTime = useAttribute("explosionDelay", { of: itemRef, charge: true }).value;
  if (velocity === undefined || flightTime === undefined) return undefined;
  return range((velocity * flightTime) / 1000, { decimals: 0 });
}
