import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, HTMLAttributes, MouseEventHandler } from "react";

import { Icon } from "../Icon/Icon";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import type { WheelRack } from "./layout";
import styles from "./WheelSlot.module.css";

export type SlotState = "offline" | "online" | "active" | "overload";

/** Measured from EVE. */
const box = {
  "--slot-size": 49,
  "--slot-centre": 193,
  "--slot-icon-centre": 195,
};

const ammoBars = [-3.6, -1.2, 1.2, 3.6];

const emptyIconScale: Partial<Record<WheelRack, number>> = { rig: 1.2 };

export interface WheelSlotProps extends HTMLAttributes<HTMLDivElement> {
  rack: WheelRack;
  /** In degrees clockwise from the top. */
  angle: number;
  typeId?: number;
  chargeTypeId?: number;
  chargeable?: boolean;
  state?: SlotState;
  activatable?: boolean;
  /** False for a slot the ship does not have. */
  available?: boolean;
  /** Shown, but not fitted yet. */
  preview?: boolean;
  /** Makes the slot a button, named `label`. */
  onPress?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
}

export function WheelSlot({
  rack,
  angle,
  typeId,
  chargeTypeId,
  chargeable = false,
  state = "online",
  activatable = false,
  available = true,
  preview = false,
  onPress,
  label,
  className,
  style,
  ...props
}: WheelSlotProps) {
  const images = useImages();
  const texture = (name: string) => ({ "--texture": `url(${images.uiTexture(name)})` }) as CSSProperties;
  const fitted = typeId !== undefined;
  const iconTypeId = chargeTypeId ?? typeId;

  return (
    <div
      {...props}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ ...box, "--angle": `${angle}deg`, ...style } as CSSProperties}
      data-state={fitted ? state : available ? "empty" : "unavailable"}
      data-preview={preview || undefined}
    >
      {fitted && <span className={styles.fill} style={texture("classes/fitting/moduleslotfill")} />}
      <span className={styles.frame} style={texture(frameTexture(fitted, preview, state, activatable))} />
      {fitted &&
        chargeable &&
        ammoBars.map((offset) => (
          <span
            key={offset}
            className={styles.ammo}
            style={{ "--offset": `${offset}deg` } as CSSProperties}
            data-loaded={chargeTypeId !== undefined || undefined}
          />
        ))}
      {iconTypeId !== undefined ? (
        <span className={styles.icon}>
          <TypeIcon typeId={iconTypeId} size={64} marker={false} />
        </span>
      ) : (
        available && (
          <span className={styles.empty} style={{ scale: emptyIconScale[rack] }}>
            <Icon name={`slot-${rack}`} />
          </span>
        )
      )}
      {onPress && <button type="button" className={styles.press} aria-label={label} onClick={onPress} />}
    </div>
  );
}

function frameTexture(fitted: boolean, preview: boolean, state: SlotState, activatable: boolean): string {
  if (!fitted) return "classes/fitting/moduleframe";
  if (preview) return "classes/fitting/moduleframedots";
  if (state === "overload") return "classes/fitting/slotoverheated";
  return activatable ? "classes/fitting/slotactive" : "classes/fitting/slotpassive";
}
