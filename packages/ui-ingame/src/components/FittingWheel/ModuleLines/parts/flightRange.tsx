import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { range } from "../../../ShipStatistics/units";
import { Attribute } from "./Attribute";

/** How far the loaded missile flies, like "46 km". */
export function useFlightRange(itemRef: ItemRef): string | undefined {
  const velocity = useAttribute("maxVelocity", { of: itemRef, charge: true }).value;
  const flightTime = useAttribute("explosionDelay", { of: itemRef, charge: true }).value;
  const targetRange = useAttribute("maxFOFTargetRange", { of: itemRef, charge: true }).value ?? Infinity;
  if (!velocity || !flightTime) return undefined;
  return range(Math.min((velocity * flightTime) / 1000, targetRange), { decimals: 0 });
}

/** "Range within 46 km"; nothing without a missile. */
export function FlightRange({ itemRef }: { itemRef: ItemRef }) {
  const flightRange = useFlightRange(itemRef);
  if (flightRange === undefined) return null;
  return <Attribute name="maxRange">Range within {flightRange}</Attribute>;
}
