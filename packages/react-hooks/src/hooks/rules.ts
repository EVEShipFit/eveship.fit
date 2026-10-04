import { canFit, droneRoom, modesOf, placementOf, type Placement, type Rack } from "@eveshipfit/fitting";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { useFit, useSnapshot } from "./fit.js";
import { useSde, useType } from "./sde.js";

const racks: readonly Rack[] = ["high", "medium", "low", "rig", "subsystem", "service"];
const noModes: readonly SdeType[] = [];

/** Where a type goes when fitted; `undefined` for what cannot be part of a fit, like a ship. */
export function usePlacement(): (type: SdeType) => Placement | undefined {
  const sde = useSde();
  return useMemo(() => (type: SdeType) => placementOf(sde, type), [sde]);
}

/** Whether a type may go on the fit's ship: `canFit`, and the ship has a slot or bay for it. */
export function useCanFit(): (type: SdeType) => boolean {
  const sde = useSde();
  const { fit, stats } = useSnapshot();
  const shipId = fit.ship.type_id;
  const shipRacks = racks.filter((rack) => stats.slots[rack].total > 0).join(" ");
  const droneBay = stats.droneBay.total > 0;

  return useMemo(() => {
    const ship = sde.type(shipId);
    const has = new Set(shipRacks.split(" "));

    return (type: SdeType) => {
      const placement = placementOf(sde, type);
      if (ship === undefined || placement === undefined || !canFit(sde, type, ship)) return false;
      if (placement.type === "drone_bay") return droneBay;
      const rack = racks.find((each) => each === placement.type);
      return rack === undefined || has.has(rack);
    };
  }, [sde, shipId, shipRacks, droneBay]);
}

/** How many more drones of a type can be active; does not follow the preview. */
export function useDroneRoom(type: SdeType): number {
  const sde = useSde();
  const { stats } = useSnapshot();
  return droneRoom(sde, stats, type);
}

/** The modes of the fit's ship, in the order EVE shows them; empty for a ship without modes. */
export function useModes(): readonly SdeType[] {
  const sde = useSde();
  const ship = useType(useFit().ship.type_id);
  return ship === undefined ? noModes : modesOf(sde, ship);
}
