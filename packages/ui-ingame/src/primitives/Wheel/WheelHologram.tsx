import { useEffect, useRef } from "react";

import { showHologram, type Hull } from "./hologram/scene";
import styles from "./WheelHull.module.css";

export interface WheelHologramProps {
  hull: Hull;
}

/** The ship as the ghost EVE shows while simulating a fit, above a grid; dragging turns it, scrolling zooms. */
export function WheelHologram({ hull }: WheelHologramProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => showHologram(canvas.current!, hull), [hull]);

  return <canvas ref={canvas} className={`${styles.hull} ${styles.hologram}`} />;
}
