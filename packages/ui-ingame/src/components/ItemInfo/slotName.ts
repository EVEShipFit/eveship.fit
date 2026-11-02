import type { Slot } from "@eveshipfit/fitting";

const slotNames: Partial<Record<Slot["type"], string>> = {
  high: "High Slot",
  medium: "Mid Slot",
  low: "Low Slot",
  rig: "Rig Slot",
  subsystem: "Subsystem Slot",
  service: "Service Slot",
  drone_bay: "Drone Bay",
  fighter_bay: "Fighter Bay",
  fighter_tube: "Fighter Tube",
  implant: "Implant Slot",
  booster: "Booster Slot",
  cargo: "Cargo",
};

/** A slot as EVE names it, like "Mid Slot 2". */
export function slotName(slot: Slot): string {
  const name = slotNames[slot.type] ?? slot.type;
  if (!("index" in slot)) return name;
  const numbered = slot.type === "implant" || slot.type === "booster";
  return `${name} ${numbered ? slot.index : slot.index + 1}`;
}
