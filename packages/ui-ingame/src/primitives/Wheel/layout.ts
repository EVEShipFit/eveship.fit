export type WheelRack = "high" | "medium" | "low" | "rig" | "subsystem";

/** In degrees, measured from EVE's fitting window. */
const racks: Record<WheelRack, { size: number; first: number; step: number }> = {
  high: { size: 8, first: -35.1, step: 10.25 },
  medium: { size: 8, first: 54, step: 10.25 },
  low: { size: 8, first: 142.9, step: 10.25 },
  rig: { size: 3, first: -73.25, step: 10.25 },
  subsystem: { size: 4, first: -126.5, step: 12.667 },
};

export function rackSize(rack: WheelRack): number {
  return racks[rack].size;
}

export function slotAngle(rack: WheelRack, index: number): number {
  return racks[rack].first + index * racks[rack].step;
}
