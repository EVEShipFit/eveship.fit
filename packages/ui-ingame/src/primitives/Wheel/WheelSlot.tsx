import { useImages } from "@eveshipfit/react-hooks";
import type { CSSProperties, DragEventHandler, HTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { Icon } from "../Icon/Icon";
import { SlotAction, SlotInfo, SlotPress } from "../SlotAction/SlotAction";
import { Tooltip } from "../Tooltip/Tooltip";
import { TypeIcon } from "../TypeIcon/TypeIcon";
import { placeAt } from "./geometry";
import type { WheelRack } from "./layout";
import styles from "./WheelSlot.module.css";

export type SlotState = "offline" | "online" | "active" | "overload";

/** Measured from EVE. */
const box = {
  "--slot-size": 60.5,
  "--slot-centre": 238,
  "--slot-icon-centre": 239,
};

/** Measured from EVE: the size of an action, the radius of the first, and the step inward to the next. */
const actions = { size: 16.5, first: 205.5, step: 16.5 };

const ammoBars = [-3.6, -1.2, 1.2, 3.6];

const emptyIconScale: Partial<Record<WheelRack, number>> = { rig: 1.2 };

export interface WheelSlotProps extends HTMLAttributes<HTMLDivElement> {
  rack: WheelRack;
  /** In degrees clockwise from the top. */
  angle: number;
  typeId?: number;
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
  onPress?: MouseEventHandler<HTMLElement>;
  /** Makes the slot draggable. */
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
  label?: string;
  /** False leaves out the actions shown on hover. */
  actions?: boolean;
  onUnfit?: () => void;
  onRemoveCharge?: () => void;
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
  onDragStart,
  onDragEnd,
  label,
  actions: showActions = true,
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

  // Each action has its place in the row, even when it is missing, as in EVE.
  const row: ({ key: string; node: ReactNode } | undefined)[] = [];
  if (fitted && !preview && showActions) {
    if (chargeTypeId !== undefined) {
      row.push(
        onRemoveCharge && {
          key: "charge",
          node: <SlotAction icon="module-unfit" label="Remove Charge" onPress={onRemoveCharge} />,
        },
      );
      row.push({ key: "charge-info", node: <SlotInfo /> });
      row.push(
        typeName === undefined
          ? undefined
          : {
              key: "module",
              node: (
                <Tooltip label={typeName}>
                  <span className={styles.module}>
                    <TypeIcon typeId={typeId} size={64} marker={false} />
                  </span>
                </Tooltip>
              ),
            },
      );
    }
    row.push(
      onUnfit && { key: "unfit", node: <SlotAction icon="module-unfit" label="Unfit Module" onPress={onUnfit} /> },
    );
    row.push({ key: "info", node: <SlotInfo /> });
    const power = state === "offline" ? "Put Online" : "Put Offline";
    row.push(
      onTogglePower && { key: "power", node: <SlotAction icon="module-power" label={power} onPress={onTogglePower} /> },
    );
  }
  const last = row.findLastIndex((action) => action !== undefined);
  const innermost = actions.first - last * actions.step - actions.size / 2;

  return (
    <div
      {...props}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ ...box, "--angle": `${angle}deg`, ...style } as CSSProperties}
      data-state={fitted ? state : available ? "empty" : "unavailable"}
      data-preview={preview || undefined}
    >
      <div
        className={styles.body}
        draggable={onDragStart !== undefined || undefined}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
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
        {onPress && <SlotPress className={styles.press} label={label} onPress={onPress} />}
      </div>
      {last >= 0 && (
        <fieldset
          className={styles.actions}
          style={{ "--action-size": actions.size } as CSSProperties}
          aria-label={typeName}
        >
          <span className={styles.bridge} style={{ "--innermost": innermost } as CSSProperties} />
          {row.map(
            (action, index) =>
              action && (
                <span
                  key={action.key}
                  className={styles.action}
                  style={placeAt(angle, actions.first - index * actions.step)}
                >
                  {action.node}
                </span>
              ),
          )}
        </fieldset>
      )}
    </div>
  );
}

function frameTexture(fitted: boolean, preview: boolean, state: SlotState, activatable: boolean): string {
  if (!fitted) return "classes/fitting/moduleframe";
  if (preview) return "classes/fitting/moduleframedots";
  if (state === "overload") return "classes/fitting/slotoverheated";
  return activatable ? "classes/fitting/slotactive" : "classes/fitting/slotpassive";
}
