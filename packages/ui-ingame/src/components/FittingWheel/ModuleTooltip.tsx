import type { ItemRef, Rack } from "@eveshipfit/fitting";
import { useAttribute, useSde, useType } from "@eveshipfit/react-hooks";

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
      <span className={styles.status} data-tone={status.tone}>
        {status.text}
      </span>
    </span>
  );
}

export function TypeRow({ typeId, count }: { typeId: number; count?: string }) {
  const type = useType(typeId);
  return (
    <span className={styles.type}>
      <TypeIcon typeId={typeId} size={24} />
      {count === undefined ? type?.name : `${count} ${type?.name}`}
    </span>
  );
}

/** The loaded charge, with how many; crystals and scripts without. */
function ChargeRow({ itemRef, typeId }: { itemRef: ItemRef; typeId: number }) {
  const sde = useSde();
  const group = sde.group(useType(typeId)?.groupId ?? 0)?.name ?? "";
  const count = useAttribute("chargeAmount", { of: itemRef, decimals: 0, rounding: "down" });
  const single = /(Crystal|Script)$/.test(group);
  return <TypeRow typeId={typeId} count={single || count.value === undefined ? undefined : count.text} />;
}

/** The last line of the tooltip. */
function moduleStatus(rack: Rack, state: SlotState, maxState: SlotState): { text: string; tone: Tone } {
  if (rack === "subsystem") return { text: "Active Subsystem", tone: "normal" };
  if (rack === "rig")
    return state === "offline" ? { text: "Inactive Rig", tone: "muted" } : { text: "Active Rig", tone: "normal" };
  const module = maxState === "online" ? "Passive Module" : "Module";
  if (state === "offline") return { text: `Offline ${module}`, tone: "muted" };
  if (state === "overload") return { text: "Overheated Module", tone: "overload" };
  if (state === "active") return { text: "Active Module", tone: "active" };
  return { text: `Online ${module}`, tone: "normal" };
}
