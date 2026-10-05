import type { ItemRef, Rack } from "@eveshipfit/fitting";
import { useAttribute, useType } from "@eveshipfit/react-hooks";

import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import type { SlotState } from "../../primitives/Wheel/WheelSlot";
import { ModuleLines } from "./ModuleLines";
import styles from "./ModuleTooltip.module.css";

type Tone = "normal" | "muted" | "active" | "overload";

export interface ModuleTooltipProps {
  rack: Rack;
  itemRef: ItemRef;
  typeId: number;
  chargeTypeId?: number;
  state: SlotState;
  maxState: SlotState;
}

/** What EVE shows when hovering a fitted module. */
export function ModuleTooltip({ rack, itemRef, typeId, chargeTypeId, state, maxState }: ModuleTooltipProps) {
  const status = moduleStatus(rack, state, maxState);
  return (
    <span className={styles.tooltip}>
      <TypeRow typeId={typeId} />
      {chargeTypeId !== undefined && <ChargeRow itemRef={itemRef} typeId={chargeTypeId} />}
      <ModuleLines typeId={typeId} itemRef={itemRef} state={state} />
      {status && (
        <span className={styles.status} data-tone={status.tone}>
          {status.text}
        </span>
      )}
    </span>
  );
}

function TypeRow({ typeId, count }: { typeId: number; count?: string }) {
  const type = useType(typeId);
  return (
    <span className={styles.type}>
      <TypeIcon typeId={typeId} size={24} />
      {count === undefined ? type?.name : `${count} ${type?.name}`}
    </span>
  );
}

function ChargeRow({ itemRef, typeId }: { itemRef: ItemRef; typeId: number }) {
  const count = useAttribute("chargeAmount", { of: itemRef, decimals: 0, rounding: "down" });
  return <TypeRow typeId={typeId} count={count.value === undefined ? undefined : count.text} />;
}

/** The last line of the tooltip; none for subsystems. */
function moduleStatus(rack: Rack, state: SlotState, maxState: SlotState): { text: string; tone: Tone } | undefined {
  if (rack === "subsystem") return undefined;
  if (rack === "rig")
    return state === "offline" ? { text: "Inactive Rig", tone: "muted" } : { text: "Active Rig", tone: "normal" };
  const module = maxState === "online" ? "Passive Module" : "Module";
  if (state === "offline") return { text: `Offline ${module}`, tone: "muted" };
  if (state === "overload") return { text: "Overheated Module", tone: "overload" };
  if (state === "active") return { text: "Active Module", tone: "active" };
  return { text: `Online ${module}`, tone: "normal" };
}
