import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, HTMLAttributes } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import styles from "./FighterTube.module.css";

export interface FighterTubeProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  typeId?: number;
  typeName?: string;
  /** Fighters in the squadron. */
  quantity?: number;
  /** Fighters in a full squadron. */
  size?: number;
  role?: IconName;
  /** False for a tube the ship does not have. */
  available?: boolean;
  /** Shown, but not launched yet. */
  preview?: boolean;
  onRemove?: () => void;
  onResize?: (quantity: number) => void;
}

/** EVE's tube of the fighter bay, empty or with a squadron in it. */
export function FighterTube({
  index,
  typeId,
  typeName,
  quantity = 0,
  size = 0,
  role,
  available = true,
  preview = false,
  onRemove,
  onResize,
  className,
  ...props
}: FighterTubeProps) {
  const images = useImages();
  const launched = typeId !== undefined;
  const actions = launched && !preview;
  const texture = (name: string) => `url(${images.uiTexture(name)})`;

  return (
    <div
      {...props}
      className={[styles.tube, className].filter(Boolean).join(" ")}
      style={
        {
          "--tube": texture("classes/carrierbay/simulatetube3"),
          "--flag": texture("classes/shipui/fighters/squadnumberflag"),
        } as CSSProperties
      }
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
      role="group"
      aria-label={`Tube ${index + 1}${typeName === undefined ? "" : `, ${typeName}`}`}
      data-state={launched ? "launched" : available ? "open" : "unavailable"}
      data-preview={preview || undefined}
    >
      <span className={styles.number}>{index + 1}</span>
      {launched ? (
        <span
          className={styles.squadron}
          style={
            {
              "--underlay": texture("classes/shipui/fighters/fighteritemunderlay"),
              "--overlay": texture("classes/shipui/fighters/fighteritemoverlay"),
            } as CSSProperties
          }
        >
          <span className={styles.picture}>
            <TypeIcon typeId={typeId} size={64} marker={false} />
          </span>
          <SquadronRing quantity={quantity} size={size} />
          {role && (
            <span className={styles.role}>
              <Icon name={role} />
            </span>
          )}
        </span>
      ) : (
        <span
          className={styles.empty}
          style={{ "--texture": texture("classes/shipui/fighters/fighteritemempty_up") } as CSSProperties}
        />
      )}
      {available && <span className={styles.label}>{launched ? "Simulated" : "Open"}</span>}
      {actions && onResize && (
        <span className={styles.resize}>
          <button type="button" aria-label={`One fewer ${typeName}`} onClick={() => onResize(quantity - 1)}>
            −
          </button>
          <button
            type="button"
            aria-label={`One more ${typeName}`}
            disabled={quantity >= size}
            onClick={() => onResize(quantity + 1)}
          >
            +
          </button>
        </span>
      )}
      {actions && onRemove && (
        <button type="button" className={styles.remove} aria-label={`Remove ${typeName}`} onClick={onRemove}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

const RING_RADIUS = 30.5;
const RING_FROM = 225;
const RING_SWEEP = 270;
const RING_GAP = 4;

/** One arc per fighter of a full squadron, lit for those in it. */
function SquadronRing({ quantity, size }: { quantity: number; size: number }) {
  const step = RING_SWEEP / Math.max(size, 1);
  return (
    <svg
      className={styles.ring}
      viewBox="-43 -43 86 86"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <meter> cannot be drawn as EVE's ring.
      role="meter"
      aria-label="Fighters"
      aria-valuemin={0}
      aria-valuemax={size}
      aria-valuenow={quantity}
      aria-valuetext={`${quantity} of ${size}`}
    >
      {Array.from({ length: size }, (_, index) => {
        const from = RING_FROM - index * step - RING_GAP / 2;
        const to = from - step + RING_GAP;
        return <path key={index} d={arc(from, to)} data-lit={index < quantity || undefined} />;
      })}
    </svg>
  );
}

/** Clockwise from `from` to `to`, in degrees counter-clockwise from the right. */
function arc(from: number, to: number): string {
  const point = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return `${(RING_RADIUS * Math.cos(radians)).toFixed(2)} ${(-RING_RADIUS * Math.sin(radians)).toFixed(2)}`;
  };
  return `M ${point(from)} A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${point(to)}`;
}
