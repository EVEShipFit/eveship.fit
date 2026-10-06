import type { CSSProperties, DragEventHandler, HTMLAttributes, ReactNode } from "react";

import { SlotAction } from "../SlotAction/SlotAction";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import { placeAt, polar } from "./geometry";
import { augmentationAngle, type Augmentation } from "./layout";
import { augmentationRadius } from "./WheelAugmentationTrack";
import styles from "./WheelAugmentation.module.css";

/** From the slot's centre, outward: past the track, and halfway there. */
const unfitOffset = 24;
const bridgeOffset = 14.5;

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
          <span className={styles.frame} style={{ "--angle": `${angle}deg` } as CSSProperties} />
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
