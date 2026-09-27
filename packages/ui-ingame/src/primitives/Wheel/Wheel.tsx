import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, ReactNode } from "react";

import styles from "./Wheel.module.css";

export interface WheelProps {
  label: string;
  children?: ReactNode;
}

/** Square, and as big as EVE's at `--esf-scale`, or as wide as `--esf-wheel-size`. */
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
