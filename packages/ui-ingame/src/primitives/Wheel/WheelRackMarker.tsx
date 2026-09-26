import { useImages } from "../../images";
import { placeAt } from "./geometry";
import type { WheelRack } from "./layout";
import styles from "./WheelRackMarker.module.css";

export type MarkedRack = Extract<WheelRack, "high" | "medium" | "low">;

const markers: Record<MarkedRack, { angle: number; texture: string }> = {
  high: { angle: -43, texture: "classes/radialmenu/fitting/high" },
  medium: { angle: 45, texture: "classes/radialmenu/fitting/med" },
  low: { angle: 135, texture: "classes/radialmenu/fitting/low" },
};

export interface WheelRackMarkerProps {
  rack: MarkedRack;
}

/** The small square in front of the high, medium and low racks, lit on the side its rack is. */
export function WheelRackMarker({ rack }: WheelRackMarkerProps) {
  const images = useImages();
  const { angle, texture } = markers[rack];

  return (
    <img
      className={styles.marker}
      style={placeAt(angle, 197)}
      src={images.uiTexture(texture)}
      alt=""
      data-marker={rack}
      draggable={false}
    />
  );
}
