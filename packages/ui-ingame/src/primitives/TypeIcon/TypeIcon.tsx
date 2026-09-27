import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties } from "react";

import styles from "./TypeIcon.module.css";

export interface TypeIconProps {
  typeId: number;
  size?: number;
  /** The tech level or faction marker. */
  marker?: boolean;
}

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
