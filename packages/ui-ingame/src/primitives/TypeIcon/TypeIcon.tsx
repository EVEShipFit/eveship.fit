import type { CSSProperties } from "react";

import { useImages } from "../../images";
import styles from "./TypeIcon.module.css";

export interface TypeIconProps {
  typeId: number;
  size?: number;
  /** Show the tech level or faction marker; EVE leaves it off in some places, like the fitting wheel. */
  marker?: boolean;
}

/** The icon of a ship, module or other item, as EVE draws it: with its tech level or faction marker. */
export function TypeIcon({ typeId, size = 32, marker = true }: TypeIconProps) {
  const images = useImages();
  const layers = images.typeIcon(typeId, { marker: false }) ?? [];
  const markerLayer = marker ? images.typeIcon(typeId)?.[layers.length] : undefined;

  return (
    <span className={styles.icon} style={{ "--size": `${size}px` } as CSSProperties}>
      {layers.map((layer) => (
        <img key={layer.src} src={layer.src} data-additive={layer.additive} alt="" loading="lazy" draggable={false} />
      ))}
      {markerLayer && <img className={styles.marker} src={markerLayer.src} alt="" loading="lazy" draggable={false} />}
    </span>
  );
}
