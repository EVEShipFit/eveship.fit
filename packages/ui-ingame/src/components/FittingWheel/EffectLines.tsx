import { useAttribute, useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import type { SlotState } from "../../primitives/Wheel/WheelSlot";
import { unit } from "../ShipStatistics/units";
import styles from "./ModuleTooltip.module.css";

interface LineProps {
  state: SlotState;
}

const Effect = {
  MicrowarpdriveBonus: 6730,
  AfterburnerBonus: 6731,
} as const;

const lines = new Map<number, ComponentType<LineProps>>([
  [Effect.MicrowarpdriveBonus, VelocityLine],
  [Effect.AfterburnerBonus, VelocityLine],
]);

/** Tooltip lines from the effects of a module. */
export function EffectLines({ typeId, state }: { typeId: number; state: SlotState }) {
  const type = useType(typeId);
  const shown = new Set([...(type?.effectIds ?? [])].flatMap((id) => lines.get(id) ?? []));
  return [...shown].map((Line, index) => <Line key={index} state={state} />);
}

function VelocityLine({ state }: LineProps) {
  const velocity = useAttribute("maxVelocity", { decimals: 2, fixed: true, grouping: false, format: unit(" m/s") });
  const running = state === "active" || state === "overload";
  return (
    <span className={styles.line}>
      <Icon name="stat-max-velocity" size={24} />
      Max Velocity {running ? "with" : "without"}: {velocity.text}
    </span>
  );
}
