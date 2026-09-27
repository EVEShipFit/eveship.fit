import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties } from "react";

import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./CapacitorRing.module.css";

const gigajoulesPerColumn = 50;
const maxColumns = 10;
const cellsPerColumn = 3;
const cells = Array.from({ length: cellsPerColumn }, (_, cell) => cell);

export interface CapacitorRingProps {
  /** In GJ. */
  capacity: number;
  /** The level the capacitor settles at, from 0 to 1; 0 when it depletes. */
  level: number;
  label: string;
}

/** EVE's ring of capacitor cells. */
export function CapacitorRing({ capacity, level, label }: CapacitorRingProps) {
  const texture = useImages().uiTexture("classes/shipui/capacitorcell");
  const columns = Math.min(maxColumns, Math.floor(capacity / gigajoulesPerColumn));
  const lit = Math.floor(level * columns * cellsPerColumn);

  return (
    <Tooltip label={label}>
      <div
        className={styles.ring}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <meter> cannot be drawn as a ring.
        role="meter"
        aria-label="Capacitor"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={level}
        aria-valuetext={label}
        style={{ "--texture": `url(${texture})`, "--level": level } as CSSProperties}
      >
        {Array.from({ length: columns }, (_, column) => (
          <div
            key={column}
            className={styles.column}
            style={{ "--angle": `${(column * 360) / columns}deg` } as CSSProperties}
          >
            {cells.map((cell) => (
              <span
                key={cell}
                className={styles.cell}
                // Cells light up from the inside out, starting left of the top and going counter-clockwise.
                data-lit={(columns - 1 - column) * cellsPerColumn + (cellsPerColumn - 1 - cell) < lit || undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </Tooltip>
  );
}
