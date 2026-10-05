import type { ItemRef } from "@eveshipfit/fitting";
import { useSde, useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import type { SlotState } from "../../../primitives/Wheel/WheelSlot";
import { CapacitorBooster } from "./CapacitorBooster";
import { RemoteCapacitorTransmitter } from "./CapacitorTransmitter";
import { EnergyNeutralizer, EnergyNosferatu } from "./EnergyWarfare";
import { MaxVelocity } from "./MaxVelocity";
import { Missile } from "./Missile";
import {
  AncillaryRemoteArmorRepairer,
  AncillaryRemoteShieldBooster,
  ArmorRepairer,
  HullRepairer,
  RemoteArmorRepairer,
  RemoteHullRepairer,
  RemoteShieldBooster,
  ShieldBooster,
} from "./Repairer";
import { Resistance } from "./Resistance";
import { ResistanceBonus } from "./ResistanceBonus";
import { RemoteSensorBooster } from "./SensorBooster";
import { Smartbomb } from "./Smartbomb";
import { RemoteTrackingComputer, TrackingComputer } from "./TrackingComputer";
import { TractorBeam } from "./TractorBeam";
import { Turret } from "./Turret";

export interface LineProps {
  itemRef: ItemRef;
  state: SlotState;
}

const lines = new Map<string, ComponentType<LineProps>[]>([
  ["moduleBonusMicrowarpdrive", [MaxVelocity]],
  ["moduleBonusAfterburner", [MaxVelocity]],
  ["modifyArmorResonancePostPercent", [ResistanceBonus]],
  ["modifyShieldResonancePostPercent", [ResistanceBonus]],
  ["modifyActiveShieldResonancePostPercent", [ResistanceBonus]],
  ["modifyActiveArmorResonancePostPercent", [ResistanceBonus]],
  ["targetAttack", [Turret]],
  ["projectileFired", [Turret]],
  ["targetDisintegratorAttack", [Turret]],
  ["useMissiles", [Missile]],
  ["energyNeutralizerFalloff", [EnergyNeutralizer]],
  ["energyNosferatuFalloff", [EnergyNosferatu]],
  ["shieldBoosting", [ShieldBooster]],
  ["fueledShieldBoosting", [ShieldBooster]],
  ["armorRepair", [ArmorRepairer]],
  ["fueledArmorRepair", [ArmorRepairer]],
  ["shipModuleRemoteArmorRepairer", [RemoteArmorRepairer]],
  ["shipModuleAncillaryRemoteArmorRepairer", [AncillaryRemoteArmorRepairer]],
  ["ShipModuleRemoteArmorMutadaptiveRepairer", [RemoteArmorRepairer]],
  ["shipModuleRemoteShieldBooster", [RemoteShieldBooster]],
  ["shipModuleAncillaryRemoteShieldBooster", [AncillaryRemoteShieldBooster]],
  ["shipModuleRemoteCapacitorTransmitter", [RemoteCapacitorTransmitter]],
  ["structureRepair", [HullRepairer]],
  ["shipModuleRemoteHullRepairer", [RemoteHullRepairer]],
  ["remoteSensorBoostFalloff", [RemoteSensorBooster]],
  ["shipModuleRemoteTrackingComputer", [RemoteTrackingComputer]],
  ["gunneryMaxRangeFalloffTrackingSpeedBonus", [TrackingComputer]],
  ["tractorBeamCan", [TractorBeam]],
  ["empWave", [Smartbomb]],
  ["powerBooster", [CapacitorBooster]],
  ["damageControl", [Resistance]],
  ["adaptiveArmorHardener", [Resistance]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines({ typeId, ...props }: { typeId: number } & LineProps) {
  const sde = useSde();
  const type = useType(typeId);
  const shown = new Set([...(type?.effectIds ?? [])].flatMap((id) => lines.get(sde.effect(id)?.name ?? "") ?? []));
  return [...shown].map((Line, index) => <Line key={index} {...props} />);
}
