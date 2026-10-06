import { useImages } from "@eveshipfit/react-hooks";

import { Tooltip } from "../Tooltip/Tooltip";
import { placeAt, polar, wheelRadius } from "./geometry";
import { augmentationAngle, type Augmentation } from "./layout";
import styles from "./WheelAugmentation.module.css";

const BOOSTER_MARKET_GROUP_ID = 977;

export const augmentationRadius = 320;

export interface WheelAugmentationTrackProps {
  kind: Augmentation;
  /** How many slots the track holds. */
  length: number;
}

/** The band implant or booster slots sit on, outside the wheel, with an icon at its top. */
export function WheelAugmentationTrack({ kind, length }: WheelAugmentationTrackProps) {
  const images = useImages();
  const icon =
    kind === "implant"
      ? images.uiTexture("windowicons/augmentations")
      : images.marketGroupIcon(BOOSTER_MARKET_GROUP_ID);
  const start = polar(augmentationAngle(kind, -0.35), augmentationRadius);
  const end = polar(augmentationAngle(kind, length - 0.65), augmentationRadius);
  const sweep = kind === "implant" ? 0 : 1;

  return (
    <>
      <svg
        className={styles.track}
        viewBox={`${-wheelRadius} ${-wheelRadius} ${2 * wheelRadius} ${2 * wheelRadius}`}
        aria-hidden
      >
        <path
          d={`M ${start.x} ${start.y} A ${augmentationRadius} ${augmentationRadius} 0 0 ${sweep} ${end.x} ${end.y}`}
        />
      </svg>
      <span className={styles.marker} style={placeAt(augmentationAngle(kind, -1.65), augmentationRadius)}>
        <Tooltip label={kind === "implant" ? "Implants" : "Boosters"}>
          <img src={icon} alt="" data-marker={kind} draggable={false} />
        </Tooltip>
      </span>
    </>
  );
}
