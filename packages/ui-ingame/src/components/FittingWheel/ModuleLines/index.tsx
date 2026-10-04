import { useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import type { SlotState } from "../../../primitives/Wheel/WheelSlot";
import { MaxVelocity } from "./MaxVelocity";

export interface LineProps {
  state: SlotState;
}

const Effect = {
  MicrowarpdriveBonus: 6730,
  AfterburnerBonus: 6731,
} as const;

const lines = new Map<number, ComponentType<LineProps>[]>([
  [Effect.MicrowarpdriveBonus, [MaxVelocity]],
  [Effect.AfterburnerBonus, [MaxVelocity]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines({ typeId, state }: { typeId: number; state: SlotState }) {
  const type = useType(typeId);
  const shown = new Set([...(type?.effectIds ?? [])].flatMap((id) => lines.get(id) ?? []));
  return [...shown].map((Line, index) => <Line key={index} state={state} />);
}
