import type { CSSProperties, DragEventHandler, HTMLAttributes, ReactNode } from "react";

import { SlotAction } from "../SlotAction/SlotAction";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import { placeAt, polar } from "./geometry";
import { augmentationAngle, type Augmentation } from "./layout";
import { augmentationRadius } from "./WheelAugmentationTrack";
import styles from "./WheelAugmentation.module.css";

const slotSize = 32;
const slotGap = 3;

/** From the slot's centre, outward: past the track, and halfway there. */
const half = slotSize / 2;

const unfitOffset = 28.99;
const bridgeOffset = 19.25;

export interface WheelAugmentationSlotProps extends HTMLAttributes<HTMLDivElement> {
  kind: Augmentation;
  /** Its place on the track, from the top. */
  position: number;
  /** Shown while the slot is empty. */
  number?: number;
  typeId?: number;
  typeName?: string;
  /** Shown, but not fitted yet. */
  preview?: boolean;
  /** Shown when hovering the slot. */
  tooltip?: ReactNode;
  /** Makes the slot draggable. */
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
  /** Also on right click. */
  onUnfit?: () => void;
}

/** A small slot for an implant or a booster, on its `WheelAugmentationTrack`. */
export function WheelAugmentationSlot({
  kind,
  position,
  number,
  typeId,
  typeName,
  preview = false,
  tooltip,
  onDragStart,
  onDragEnd,
  onUnfit,
  className,
  style,
  ...props
}: WheelAugmentationSlotProps) {
  const angle = augmentationAngle(kind, position);
  const unfit = polar(angle, unfitOffset);
  const bridge = polar(angle, bridgeOffset);

  return (
    <div
      {...props}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ ...placeAt(angle, augmentationRadius), ...style }}
      data-kind={kind}
      data-filled={typeId !== undefined || undefined}
      data-preview={preview || undefined}
      onContextMenu={
        onUnfit &&
        ((event) => {
          event.preventDefault();
          onUnfit();
        })
      }
    >
      <Tooltip label={tooltip}>
        <div
          className={styles.body}
          draggable={onDragStart !== undefined || undefined}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <svg className={styles.frame} viewBox={`${-half} ${-half} ${2 * half} ${2 * half}`} aria-hidden>
            <path d={framePath(kind, position)} />
          </svg>
          {typeId !== undefined ? (
            <span className={styles.icon}>
              <TypeIcon typeId={typeId} size={64} marker={false} />
            </span>
          ) : (
            number !== undefined && <span className={styles.number}>{number}</span>
          )}
        </div>
      </Tooltip>
      {typeId !== undefined && onUnfit && (
        <fieldset className={styles.actions} aria-label={typeName}>
          <span className={styles.bridge} style={{ "--x": bridge.x, "--y": bridge.y } as CSSProperties} />
          <span className={styles.action} style={{ "--x": unfit.x, "--y": unfit.y } as CSSProperties}>
            <SlotAction
              icon="module-unfit"
              label={kind === "implant" ? "Unfit Implant" : "Unfit Booster"}
              onPress={onUnfit}
            />
          </span>
        </fieldset>
      )}
    </div>
  );
}

/** The slot as a piece of its track, around its centre; the gaps to its neighbours as wide inside as out. */
function framePath(kind: Augmentation, position: number): string {
  const centre = polar(augmentationAngle(kind, position), augmentationRadius);
  const corner = (side: -0.5 | 0.5, radius: number) => {
    const edge = (augmentationAngle(kind, position + side) * Math.PI) / 180;
    const along = Math.sqrt(radius * radius - (slotGap / 2) ** 2);
    // Pushed off the edge between two slots, towards this one.
    const off = (slotGap / 2) * Math.sign(augmentationAngle(kind, position) - augmentationAngle(kind, position + side));
    const x = along * Math.sin(edge) + off * Math.cos(edge);
    const y = -along * Math.cos(edge) + off * Math.sin(edge);
    return `${round(x - centre.x)} ${round(y - centre.y)}`;
  };
  const inner = augmentationRadius - half;
  const outer = augmentationRadius + half;
  const sweep = augmentationAngle(kind, position + 0.5) > augmentationAngle(kind, position) ? 1 : 0;
  return [
    `M ${corner(-0.5, inner)}`,
    `L ${corner(-0.5, outer)}`,
    `A ${outer} ${outer} 0 0 ${sweep} ${corner(0.5, outer)}`,
    `L ${corner(0.5, inner)}`,
    `A ${inner} ${inner} 0 0 ${1 - sweep} ${corner(-0.5, inner)}`,
    "Z",
  ].join(" ");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
