import { useId } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import { placeAt } from "./geometry";
import styles from "./WheelModes.module.css";

/** Measured from EVE, in the order it shows the modes. */
const places: readonly { angle: number; icon: IconName }[] = [
  { angle: -99, icon: "mode-defense" },
  { angle: -109, icon: "mode-sharpshooter" },
  { angle: -119, icon: "mode-propulsion" },
];

export interface WheelMode {
  typeId: number;
  name: string;
}

export interface WheelModesProps {
  /** In the order EVE shows them. */
  modes: readonly WheelMode[];
  active: number | undefined;
  /** Without it, the modes cannot be switched. */
  onSelect?: (typeId: number) => void;
}

/** The modes of a ship, like a tactical destroyer's; the active one lit. */
export function WheelModes({ modes, active, onSelect }: WheelModesProps) {
  const group = useId();

  return (
    <div className={styles.modes} role="radiogroup" aria-label="Mode">
      {modes.slice(0, places.length).map((mode, index) => (
        <span key={mode.typeId} className={styles.place} style={placeAt(places[index]!.angle, 242)}>
          <Tooltip label={mode.name}>
            <label className={styles.mode}>
              <input
                type="radio"
                name={group}
                aria-label={mode.name}
                checked={mode.typeId === active}
                disabled={onSelect === undefined}
                onChange={() => onSelect?.(mode.typeId)}
              />
              <Icon name={places[index]!.icon} size={32} />
            </label>
          </Tooltip>
        </span>
      ))}
    </div>
  );
}
