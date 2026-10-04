import type { ItemRef } from "@eveshipfit/fitting";
import { useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import type { SlotState } from "../../../primitives/Wheel/WheelSlot";
import { MaxVelocity } from "./MaxVelocity";
import { ResistanceBonus } from "./ResistanceBonus";

export interface LineProps {
  itemRef: ItemRef;
  state: SlotState;
}

const Effect = {
  MicrowarpdriveBonus: 6730,
  AfterburnerBonus: 6731,
  ArmorResonance: 2041,
  ShieldResonance: 2052,
  ArmorResonancePassive: 2792,
  ShieldResonancePassive: 2795,
  ActiveShieldResonance: 5230,
  ActiveArmorResonance: 5231,
} as const;

const lines = new Map<number, ComponentType<LineProps>[]>([
  [Effect.MicrowarpdriveBonus, [MaxVelocity]],
  [Effect.AfterburnerBonus, [MaxVelocity]],
  [Effect.ArmorResonance, [ResistanceBonus]],
  [Effect.ShieldResonance, [ResistanceBonus]],
  [Effect.ArmorResonancePassive, [ResistanceBonus]],
  [Effect.ShieldResonancePassive, [ResistanceBonus]],
  [Effect.ActiveShieldResonance, [ResistanceBonus]],
  [Effect.ActiveArmorResonance, [ResistanceBonus]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines({ typeId, ...props }: { typeId: number } & LineProps) {
  const type = useType(typeId);
  const shown = new Set([...(type?.effectIds ?? [])].flatMap((id) => lines.get(id) ?? []));
  return [...shown].map((Line, index) => <Line key={index} {...props} />);
}
