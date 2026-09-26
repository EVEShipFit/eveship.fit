import type { CSSProperties, ReactNode } from "react";

import { useImages } from "../../images";
import styles from "./Wheel.module.css";

export interface WheelProps {
  label: string;
  /** The parts on the wheel, like slots and gauges. */
  children?: ReactNode;
}

/**
 * EVE's fitting wheel: its rings, and the scales of its gauges, from EVE's own textures. It is as wide as
 * `--esf-wheel-size`, and always square.
 */
export function Wheel({ label, children }: WheelProps) {
  const images = useImages();
  const texture = (name: string) => ({ "--texture": `url(${images.uiTexture(name)})` }) as CSSProperties;

  return (
    <section className={styles.wheel} aria-label={label}>
      <div className={styles.rings} style={texture("classes/fitting/fittingbase")} />
      <div className={styles.edges} style={texture("classes/fitting/fittingbase_dotproduct")} />
      {children}
      <div className={styles.scales} style={texture("classes/fitting/fittingbase_overlay")} />
    </section>
  );
}
