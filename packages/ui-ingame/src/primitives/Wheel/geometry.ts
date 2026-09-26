/** The wheel is drawn around its centre, in a box this many units from centre to edge; every length is in these units. */
export const wheelRadius = 232;

export interface Point {
  x: number;
  y: number;
}

/** The point `radius` from the centre, `angle` degrees clockwise from the top, as CSS rotations go. */
export function polar(angle: number, radius: number): Point {
  const radians = (angle * Math.PI) / 180;
  return { x: round(radius * Math.sin(radians)), y: round(-radius * Math.cos(radians)) };
}

/** Where to put an element's centre, as a share of the wheel, for it to sit `radius` from the centre at `angle`. */
export function placeAt(angle: number, radius: number): { left: string; top: string } {
  const { x, y } = polar(angle, radius);
  return { left: `${round(50 + (x / wheelRadius) * 50)}%`, top: `${round(50 + (y / wheelRadius) * 50)}%` };
}

// Keeps the values short and free of floating point noise like 1.2e-14.
function round(value: number): number {
  return Math.round(value * 1000) / 1000 + 0;
}
