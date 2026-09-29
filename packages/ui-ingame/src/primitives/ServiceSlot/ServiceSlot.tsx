import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, DragEventHandler, HTMLAttributes, MouseEventHandler } from "react";

import { Icon } from "../Icon/Icon";
import { SlotAction, SlotInfo, SlotPress } from "../SlotAction/SlotAction";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import type { SlotState } from "../Wheel/WheelSlot";
import styles from "./ServiceSlot.module.css";

export interface ServiceSlotProps extends HTMLAttributes<HTMLDivElement> {
  typeId?: number;
  typeName?: string;
  state?: SlotState;
  /** False for a slot the structure does not have. */
  available?: boolean;
  /** Shown, but not fitted yet. */
  preview?: boolean;
  /** Makes the slot a button, named `label`. */
  onPress?: MouseEventHandler<HTMLElement>;
  /** Makes the slot draggable. */
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
  label?: string;
  onUnfit?: () => void;
  onTogglePower?: () => void;
}

/** EVE's square slot of a structure service module, below the wheel. */
export function ServiceSlot({
  typeId,
  typeName,
  state = "online",
  available = true,
  preview = false,
  onPress,
  onDragStart,
  onDragEnd,
  label,
  onUnfit,
  onTogglePower,
  className,
  ...props
}: ServiceSlotProps) {
  const images = useImages();
  const fitted = typeId !== undefined;
  const frame =
    fitted && !preview ? "classes/fitting/slotpassive_structure" : "classes/fitting/stationserviceslotframe";
  const actions = fitted && !preview;

  return (
    <div
      {...props}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      data-state={fitted ? state : available ? "empty" : "unavailable"}
      data-preview={preview || undefined}
    >
      <div
        className={styles.body}
        style={{ "--texture": `url(${images.uiTexture(frame)})` } as CSSProperties}
        draggable={onDragStart !== undefined || undefined}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {fitted ? (
          <span className={styles.icon}>
            <TypeIcon typeId={typeId} size={64} marker={false} />
          </span>
        ) : (
          available && (
            <span className={styles.empty}>
              <Icon name="slot-service" />
            </span>
          )
        )}
        {onPress && <SlotPress className={styles.press} label={label} onPress={onPress} />}
      </div>
      {actions && (
        <fieldset className={styles.actions} aria-label={typeName}>
          <span className={styles.action}>
            {onUnfit && <SlotAction icon="module-unfit" label="Unfit Module" onPress={onUnfit} />}
          </span>
          <span className={styles.action}>
            <SlotInfo />
          </span>
          {onTogglePower && (
            <span className={styles.action}>
              <SlotAction
                icon="module-power"
                label={state === "offline" ? "Put Online" : "Put Offline"}
                onPress={onTogglePower}
              />
            </span>
          )}
        </fieldset>
      )}
    </div>
  );
}
