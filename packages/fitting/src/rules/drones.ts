import type { Sde, SdeType } from "@eveshipfit/sde-loader";

import type { Stats } from "../stats.js";
import { baseValue } from "./attributes.js";

/** How many more drones of a type can be active, within the active drone limit and the drone bandwidth. */
export function droneRoom(sde: Sde, stats: Stats, type: SdeType): number {
  const byCount = (stats.character.get("maxActiveDrones") ?? 0) - (stats.ship.get("droneActive") ?? 0);
  const bandwidthLeft = (stats.ship.get("droneBandwidth") ?? 0) - (stats.ship.get("droneBandwidthLoad") ?? 0);
  const bandwidth = baseValue(sde, type, "droneBandwidthUsed") ?? 0;
  const byBandwidth = bandwidth > 0 ? Math.floor(bandwidthLeft / bandwidth + 1e-9) : Infinity;
  return Math.max(0, Math.min(byCount, byBandwidth));
}
