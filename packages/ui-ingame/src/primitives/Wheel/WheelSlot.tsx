import type { CSSProperties, HTMLAttributes } from "react";

import { useImages } from "../../images";
import { Icon } from "../Icon/Icon";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import type { WheelRack } from "./layout";
import styles from "./WheelSlot.module.css";

export type SlotState = "offline" | "online" | "active" | "overload";

/**
 * Every slot is drawn at the top of the wheel, then turned into place; this is where it sits there, in wheel units,
 * measured from EVE. EVE's slot textures are square, with the frame 177 to 210 units out.
 */
const box = {
  "--slot-size": 49,
  "--slot-centre": 193,
  // Icons sit a little further out than the middle of the texture.
  "--slot-icon-centre": 195,
};

// Whether ammo is loaded: bars along the outer edge, centred on the slot, in degrees from its middle.
const ammoBars = [-3.6, -1.2, 1.2, 3.6];

// EVE draws the rig icon larger than the others.
const emptyIconScale: Partial<Record<WheelRack, number>> = { rig: 1.2 };

export interface WheelSlotProps extends HTMLAttributes<HTMLDivElement> {
  /** The rack the slot is in, for its icon when empty. */
  rack: WheelRack;
  /** Where on the wheel, in degrees clockwise from the top. */
  angle: number;
  /** The fitted module; leave out for an empty slot. */
  typeId?: number;
  /** The charge loaded in the module, shown instead of it. */
  chargeTypeId?: number;
  /** Whether the module takes charges; EVE then shows whether one is loaded. */
  chargeable?: boolean;
  state?: SlotState;
  /** Whether the module can be activated, rather than only being online. */
  activatable?: boolean;
  /** False for a slot the ship does not have, which EVE draws as a faint outline. */
  available?: boolean;
  /** For a module that is shown but not fitted yet. */
  preview?: boolean;
}

/** One slot on a `Wheel`. It only draws; give it a role and handlers to make it do something. */
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
    </div>
  );
}

/** Modules that can be activated get a bar on the inner edge, and the others a mark in each corner. */
function frameTexture(fitted: boolean, preview: boolean, state: SlotState, activatable: boolean): string {
  if (!fitted) return "classes/fitting/moduleframe";
  if (preview) return "classes/fitting/moduleframedots";
  if (state === "overload") return "classes/fitting/slotoverheated";
  return activatable ? "classes/fitting/slotactive" : "classes/fitting/slotpassive";
}
