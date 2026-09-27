import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, HTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { Icon, type IconName } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import { placeAt } from "./geometry";
import type { WheelRack } from "./layout";
import styles from "./WheelSlot.module.css";

export type SlotState = "offline" | "online" | "active" | "overload";

/** Measured from EVE. */
const box = {
  "--slot-size": 49,
  "--slot-centre": 193,
  "--slot-icon-centre": 195,
};

/** Measured from EVE: the actions go inward from the slot, one every `step`. */
const actions = { size: 16, first: 156.5, step: 20 };

const ammoBars = [-3.6, -1.2, 1.2, 3.6];

const emptyIconScale: Partial<Record<WheelRack, number>> = { rig: 1.2 };

export interface WheelSlotProps extends HTMLAttributes<HTMLDivElement> {
  rack: WheelRack;
  /** In degrees clockwise from the top. */
  angle: number;
  typeId?: number;
  /** Shown on the module's own icon, next to the slot, while a charge is loaded. */
  typeName?: string;
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
  /** The buttons next to a fitted slot, while it is hovered or has keyboard focus. */
  onUnfit?: () => void;
  /** Only shown while a charge is loaded. */
  onRemoveCharge?: () => void;
  /** Puts an offline module online, and any other module offline. */
  onTogglePower?: () => void;
}

export function WheelSlot({
  rack,
  angle,
  typeId,
  typeName,
  chargeTypeId,
  chargeable = false,
  state = "online",
  activatable = false,
  available = true,
  preview = false,
  onPress,
  label,
  onUnfit,
  onRemoveCharge,
  onTogglePower,
  className,
  style,
  ...props
}: WheelSlotProps) {
  const images = useImages();
  const texture = (name: string) => ({ "--texture": `url(${images.uiTexture(name)})` }) as CSSProperties;
  const fitted = typeId !== undefined;
  const iconTypeId = chargeTypeId ?? typeId;

  const shown: { key: string; node: ReactNode }[] = [];
  if (fitted && !preview) {
    if (chargeTypeId !== undefined && onRemoveCharge) {
      shown.push({
        key: "charge",
        node: <Action icon="module-unfit" label="Remove Charge" onPress={onRemoveCharge} />,
      });
    }
    if (chargeTypeId !== undefined && typeName !== undefined) {
      shown.push({
        key: "module",
        node: (
          <Tooltip label={typeName}>
            <span className={styles.module}>
              <TypeIcon typeId={typeId} size={64} marker={false} />
            </span>
          </Tooltip>
        ),
      });
    }
    if (onUnfit) {
      shown.push({ key: "unfit", node: <Action icon="module-unfit" label="Unfit Module" onPress={onUnfit} /> });
    }
    if (onTogglePower) {
      const power = state === "offline" ? "Put Online" : "Put Offline";
      shown.push({ key: "power", node: <Action icon="module-power" label={power} onPress={onTogglePower} /> });
    }
  }
  const innermost = actions.first - (shown.length - 1) * actions.step - actions.size / 2;

  return (
    <div
      {...props}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ ...box, "--angle": `${angle}deg`, ...style } as CSSProperties}
      data-state={fitted ? state : available ? "empty" : "unavailable"}
      data-preview={preview || undefined}
    >
      <div className={styles.body}>
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
      {shown.length > 0 && (
        <fieldset
          className={styles.actions}
          style={{ "--action-size": actions.size } as CSSProperties}
          aria-label={typeName}
        >
          <span className={styles.bridge} style={{ "--innermost": innermost } as CSSProperties} />
          {shown.map(({ key, node }, index) => (
            <span key={key} className={styles.action} style={placeAt(angle, actions.first - index * actions.step)}>
              {node}
            </span>
          ))}
        </fieldset>
      )}
    </div>
  );
}

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Tooltip label={label}>
      <button type="button" className={styles.button} aria-label={label} onClick={onPress}>
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

function frameTexture(fitted: boolean, preview: boolean, state: SlotState, activatable: boolean): string {
  if (!fitted) return "classes/fitting/moduleframe";
  if (preview) return "classes/fitting/moduleframedots";
  if (state === "overload") return "classes/fitting/slotoverheated";
  return activatable ? "classes/fitting/slotactive" : "classes/fitting/slotpassive";
}
