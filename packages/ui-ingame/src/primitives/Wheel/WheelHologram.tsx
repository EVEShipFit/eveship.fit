import { useEffect, useRef } from "react";

import { showHologram } from "./hologram/scene";
import styles from "./WheelHull.module.css";

export interface WheelHologramProps {
  /** URL of the ship's glTF model. */
  model: string;
}

/** The ship as the ghost EVE shows while simulating a fit, above a grid; dragging turns it. */
export function WheelHologram({ model }: WheelHologramProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => showHologram(canvas.current!, model), [model]);

  return <canvas ref={canvas} className={`${styles.hull} ${styles.hologram}`} />;
}
