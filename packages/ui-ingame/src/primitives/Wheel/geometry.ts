export const wheelRadius = 232;

export interface Point {
  x: number;
  y: number;
}

/** `angle` in degrees clockwise from the top, as CSS rotations go. */
export function polar(angle: number, radius: number): Point {
  const radians = (angle * Math.PI) / 180;
  return { x: round(radius * Math.sin(radians)), y: round(-radius * Math.cos(radians)) };
}

/** Where an element's centre goes, in percentages of the wheel. */
export function placeAt(angle: number, radius: number): { left: string; top: string } {
  const { x, y } = polar(angle, radius);
  return { left: `${round(50 + (x / wheelRadius) * 50)}%`, top: `${round(50 + (y / wheelRadius) * 50)}%` };
}

// Drops floating point noise like 1.2e-14.
function round(value: number): number {
  return Math.round(value * 1000) / 1000 + 0;
}
