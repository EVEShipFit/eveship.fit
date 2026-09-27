import { canFit, placementOf, type Placement } from "@eveshipfit/fitting";
import type { SdeType } from "@eveshipfit/sde-loader";

import { useSnapshot } from "./fit.js";
import { useSde } from "./sde.js";

/** Where a type goes when fitted; `undefined` for what cannot be part of a fit, like a ship. */
export function usePlacement(): (type: SdeType) => Placement | undefined {
  const sde = useSde();
  return (type) => placementOf(sde, type);
}

/** Whether a type may go on the fit's ship: `canFit`, and the ship has a slot or bay for it. */
export function useCanFit(): (type: SdeType) => boolean {
  const sde = useSde();
  const { fit, stats } = useSnapshot();
  const ship = sde.type(fit.ship.type_id);

  return (type) => {
    const placement = placementOf(sde, type);
    if (ship === undefined || placement === undefined || !canFit(sde, type, ship)) return false;

    switch (placement.type) {
      case "high":
      case "medium":
      case "low":
      case "rig":
      case "subsystem":
      case "service":
        return stats.slots[placement.type].total > 0;
      case "drone_bay":
        return stats.droneBay.total > 0;
      case "fighter_bay":
        return (stats.ship.get("fighterCapacity") ?? 0) > 0;
      default:
        return true;
    }
  };
}
