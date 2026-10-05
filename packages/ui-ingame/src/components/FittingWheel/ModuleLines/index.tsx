import type { ItemRef } from "@eveshipfit/fitting";
import { useSde, useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import type { SlotState } from "../../../primitives/Wheel/WheelSlot";
import { CapacitorBooster } from "./CapacitorBooster";
import { RemoteCapacitorTransmitter } from "./CapacitorTransmitter";
import { GuidanceDisruptor, TrackingDisruptor } from "./Disruptor";
import { BurstJammer, Ecm } from "./Ecm";
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
import { RemoteSensorBooster, SensorBooster } from "./SensorBooster";
import { ShipScanner } from "./ShipScanner";
import { SignatureSuppressor, TargetPainter } from "./SignatureRadius";
import { Smartbomb } from "./Smartbomb";
import { StasisWebifier } from "./StasisWebifier";
import { RemoteTrackingComputer, TrackingComputer } from "./TrackingComputer";
import { TractorBeam } from "./TractorBeam";
import { Turret } from "./Turret";
import { WarpDisruptionFieldGenerator, WarpScrambler } from "./WarpScrambler";

export interface LineProps {
  itemRef: ItemRef;
  state: SlotState;
}

const lines = new Map<string, ComponentType<LineProps>[]>([
  ["adaptiveArmorHardener", [Resistance]],
  ["armorRepair", [ArmorRepairer]],
  ["damageControl", [Resistance]],
  ["ECMBurstJammer", [BurstJammer]],
  ["empWave", [Smartbomb]],
  ["energyNeutralizerFalloff", [EnergyNeutralizer]],
  ["energyNosferatuFalloff", [EnergyNosferatu]],
  ["fueledArmorRepair", [ArmorRepairer]],
  ["fueledShieldBoosting", [ShieldBooster]],
  ["gunneryMaxRangeFalloffTrackingSpeedBonus", [TrackingComputer]],
  ["modifyActiveArmorResonancePostPercent", [ResistanceBonus]],
  ["modifyActiveShieldResonancePostPercent", [ResistanceBonus]],
  ["modifyArmorResonancePostPercent", [ResistanceBonus]],
  ["modifyShieldResonancePostPercent", [ResistanceBonus]],
  ["moduleBonusAfterburner", [MaxVelocity]],
  ["moduleBonusMicrowarpdrive", [MaxVelocity]],
  ["powerBooster", [CapacitorBooster]],
  ["projectileFired", [Turret]],
  ["remoteECMFalloff", [Ecm]],
  ["remoteSensorBoostFalloff", [RemoteSensorBooster]],
  ["remoteSensorDampFalloff", [RemoteSensorBooster]],
  ["remoteTargetPaintFalloff", [TargetPainter]],
  ["remoteWebifierFalloff", [StasisWebifier]],
  ["sensorBoosterActivePercentage", [SensorBooster]],
  ["shieldBoosting", [ShieldBooster]],
  ["shipModuleAncillaryRemoteArmorRepairer", [AncillaryRemoteArmorRepairer]],
  ["shipModuleAncillaryRemoteShieldBooster", [AncillaryRemoteShieldBooster]],
  ["shipModuleGuidanceDisruptor", [GuidanceDisruptor]],
  ["ShipModuleRemoteArmorMutadaptiveRepairer", [RemoteArmorRepairer]],
  ["shipModuleRemoteArmorRepairer", [RemoteArmorRepairer]],
  ["shipModuleRemoteCapacitorTransmitter", [RemoteCapacitorTransmitter]],
  ["shipModuleRemoteHullRepairer", [RemoteHullRepairer]],
  ["shipModuleRemoteShieldBooster", [RemoteShieldBooster]],
  ["shipModuleRemoteTrackingComputer", [RemoteTrackingComputer]],
  ["shipModuleTrackingDisruptor", [TrackingDisruptor]],
  ["shipScan", [ShipScanner]],
  ["signatureRadiusBonusOnline", [SignatureSuppressor]],
  ["structureRepair", [HullRepairer]],
  ["targetAttack", [Turret]],
  ["targetDisintegratorAttack", [Turret]],
  ["tractorBeamCan", [TractorBeam]],
  ["useMissiles", [Missile]],
  ["warpDisrupt", [WarpScrambler]],
  ["warpDisruptSphere", [WarpDisruptionFieldGenerator]],
  ["warpScrambleBlockMWDWithNPCEffect", [WarpScrambler]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines({ typeId, ...props }: { typeId: number } & LineProps) {
  const sde = useSde();
  const type = useType(typeId);
  const shown = new Set([...(type?.effectIds ?? [])].flatMap((id) => lines.get(sde.effect(id)?.name ?? "") ?? []));
  return [...shown].map((Line, index) => <Line key={index} {...props} />);
}
