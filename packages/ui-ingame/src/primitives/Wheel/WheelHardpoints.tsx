import { useImages } from "../../images";
import { Icon, type IconName } from "../Icon/Icon";
import { placeAt } from "./geometry";
import styles from "./WheelHardpoints.module.css";

export interface Hardpoints {
  used: number;
  total: number;
}

export interface WheelHardpointsProps {
  turrets: Hardpoints;
  launchers: Hardpoints;
}

/** The turret and launcher hardpoints, as dots on the outer ring either side of the high rack; used ones are filled. */
export function WheelHardpoints({ turrets, launchers }: WheelHardpointsProps) {
  const label = `Turret hardpoints: ${turrets.used} of ${turrets.total} used. Launcher hardpoints: ${launchers.used} of ${launchers.total} used.`;

  return (
    <>
      <HardpointIcon name="hardpoint-turret" angle={-43} />
      <HardpointIcon name="hardpoint-launcher" angle={45} />
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An <img> cannot hold the dots. */}
      <div className={styles.dots} role="img" aria-label={label}>
        <Dots {...turrets} first={-38.5} step={3} />
        <Dots {...launchers} first={40.5} step={-3} />
      </div>
    </>
  );
}

function HardpointIcon({ name, angle }: { name: IconName; angle: number }) {
  return (
    <span className={styles.icon} style={placeAt(angle, 223.5)}>
      <Icon name={name} />
    </span>
  );
}

function Dots({ used, total, first, step }: Hardpoints & { first: number; step: number }) {
  const images = useImages();

  return Array.from({ length: total }, (_, index) => (
    <img
      key={index}
      className={styles.dot}
      style={placeAt(first + index * step, 224.5)}
      src={images.uiTexture(index < used ? "classes/fitting/slottaken" : "classes/fitting/slotleft")}
      alt=""
      data-used={index < used || undefined}
      draggable={false}
    />
  ));
}
