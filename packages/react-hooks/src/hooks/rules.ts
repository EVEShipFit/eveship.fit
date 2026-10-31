import {
  acceptsCharge,
  canFit,
  droneRoom,
  firstFreeIndex,
  modesOf,
  placementOf,
  type Placement,
  type Rack,
  type SlotType,
} from "@eveshipfit/fitting";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo } from "react";

import { useShownSnapshot, useSnapshot } from "./fit.js";
import { useSde, useType } from "./sde.js";

const racks: readonly Rack[] = ["high", "medium", "low", "rig", "subsystem", "service"];
const bays: readonly SlotType[] = ["cargo", "drone_bay", "fighter_bay"];
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

/** Whether the fit's ship refuses a type that has a place on a fit. */
export function useHullRefuses(): (type: SdeType) => boolean {
  const placement = usePlacement();
  const fits = useCanFit();
  return useMemo(() => (type: SdeType) => placement(type) !== undefined && !fits(type), [placement, fits]);
}

/** Whether the fit has a free slot for a module, or a fitted module for a charge; true for any other type. */
export function useHasRoom(): (type: SdeType) => boolean {
  const sde = useSde();
  const { fit, stats } = useSnapshot();

  return useMemo(
    () => (type: SdeType) => {
      const placement = placementOf(sde, type);
      switch (placement?.type) {
        case "high":
        case "medium":
        case "low":
        case "rig":
        case "service":
          return firstFreeIndex(fit, placement.type, stats.slots[placement.type].total) !== undefined;
        case "charge":
          return fit.items.some((item) => {
            const module = sde.type(item.type_id);
            return module !== undefined && !bays.includes(item.slot.type) && acceptsCharge(sde, module, type);
          });
        default:
          return true;
      }
    },
    [sde, fit, stats],
  );
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
  const ship = useType(useShownSnapshot().fit.ship.type_id);
  return ship === undefined ? noModes : modesOf(sde, ship);
}
