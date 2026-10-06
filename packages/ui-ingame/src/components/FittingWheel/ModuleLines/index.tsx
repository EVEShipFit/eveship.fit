import type { ItemRef } from "@eveshipfit/fitting";
import { useSde, useType } from "@eveshipfit/react-hooks";
import type { ComponentType } from "react";

import type { SlotState } from "../../../primitives/Wheel/WheelSlot";
import { ActivationRange } from "./ActivationRange";
import { BreacherPodLauncher } from "./BreacherPodLauncher";
import { CapacitorBooster } from "./CapacitorBooster";
import { RemoteCapacitorTransmitter } from "./CapacitorTransmitter";
import { Cloak } from "./Cloak";
import { CommandBonus } from "./CommandBonus";
import { Compressor } from "./Compressor";
import { WeaponDisruptor } from "./Disruptor";
import { Ecm } from "./Ecm";
import { EnergyNeutralizer, EnergyNosferatu } from "./EnergyWarfare";
import { MaxVelocity } from "./MaxVelocity";
import { Mining, MiningRange } from "./Mining";
import { Missile } from "./Missile";
import { ProbeLauncher } from "./ProbeLauncher";
import { ArmorRepairer, HullRepairer, RemoteShieldBooster, ShieldBooster } from "./Repairer";
import { DamageControl, Resistance } from "./Resistance";
import { ResistanceBonus } from "./ResistanceBonus";
import { SensorBooster } from "./SensorBooster";
import { SignatureSuppressor, TargetPainter } from "./SignatureRadius";
import { Doomsday, PointDefense, Smartbomb } from "./Smartbomb";
import { StasisWebifier } from "./StasisWebifier";
import { TrackingComputer } from "./TrackingComputer";
import { TractorBeam } from "./TractorBeam";
import { Turret } from "./Turret";
import { WarpScrambler } from "./WarpScrambler";

export interface LineProps {
  itemRef: ItemRef;
  typeId: number;
  state: SlotState;
}

const lines = new Map<string, ComponentType<LineProps>[]>([
  ["adaptiveArmorHardener", [Resistance]],
  ["armorRepair", [ArmorRepairer]],
  ["cargoScan", [ActivationRange]],
  ["ChainLightning", [Turret]],
  ["cloaking", [Cloak]],
  ["cloakingPrototype", [Cloak]],
  ["cloakingWarpSafe", [Cloak]],
  ["damageControl", [DamageControl]],
  ["debuffLance", [Doomsday]],
  ["doHacking", [ActivationRange]],
  ["doomsdayBeamDOT", [Doomsday]],
  ["doomsdayConeDOT", [Doomsday]],
  ["doomsdaySlash", [Doomsday]],
  ["ECMBurstJammer", [Ecm]],
  ["emergencyHullEnergizer", [DamageControl]],
  ["empWave", [Smartbomb]],
  ["energyNeutralizerFalloff", [EnergyNeutralizer]],
  ["energyNosferatuFalloff", [EnergyNosferatu]],
  ["entosisLink", [ActivationRange]],
  ["fueledArmorRepair", [ArmorRepairer]],
  ["fueledShieldBoosting", [ShieldBooster]],
  ["gunneryMaxRangeFalloffTrackingSpeedBonus", [TrackingComputer]],
  ["industrialItemCompression", [Compressor]],
  ["lightningWeapon", [Doomsday]],
  ["miningClouds", [Mining]],
  ["miningLaser", [Mining]],
  ["modifyActiveArmorResonancePostPercent", [ResistanceBonus]],
  ["modifyActiveShieldResonancePostPercent", [ResistanceBonus]],
  ["modifyArmorResonancePostPercent", [ResistanceBonus]],
  ["modifyShieldResonancePostPercent", [ResistanceBonus]],
  ["moduleBonusAfterburner", [MaxVelocity]],
  ["moduleBonusIndustrialInvulnerability", [ActivationRange]],
  ["moduleBonusMicrowarpdrive", [MaxVelocity]],
  ["moduleBonusWarfareLinkArmor", [ActivationRange]],
  ["moduleBonusWarfareLinkInfo", [ActivationRange]],
  ["moduleBonusWarfareLinkMining", [ActivationRange]],
  ["moduleBonusWarfareLinkShield", [ActivationRange]],
  ["moduleBonusWarfareLinkSkirmish", [ActivationRange]],
  ["moduleTitanEffectGenerator", [ActivationRange]],
  ["pointDefense", [PointDefense]],
  ["powerBooster", [CapacitorBooster]],
  ["projectileFired", [Turret]],
  ["remoteECMFalloff", [Ecm]],
  ["remoteSensorBoostFalloff", [SensorBooster]],
  ["remoteSensorDampFalloff", [SensorBooster]],
  ["remoteTargetPaintFalloff", [TargetPainter]],
  ["remoteWebifierFalloff", [StasisWebifier]],
  ["salvaging", [ActivationRange]],
  ["sensorBoosterActivePercentage", [SensorBooster]],
  ["shieldBoosting", [ShieldBooster]],
  ["shipModuleAncillaryRemoteArmorRepairer", [ArmorRepairer]],
  ["shipModuleAncillaryRemoteShieldBooster", [ActivationRange]],
  ["shipModuleGuidanceDisruptor", [WeaponDisruptor]],
  ["ShipModuleRemoteArmorMutadaptiveRepairer", [ArmorRepairer]],
  ["shipModuleRemoteArmorRepairer", [ArmorRepairer]],
  ["shipModuleRemoteCapacitorTransmitter", [RemoteCapacitorTransmitter]],
  ["shipModuleRemoteHullRepairer", [HullRepairer]],
  ["shipModuleRemoteShieldBooster", [RemoteShieldBooster]],
  ["shipModuleRemoteTrackingComputer", [TrackingComputer]],
  ["shipModuleTrackingDisruptor", [WeaponDisruptor]],
  ["shipScan", [ActivationRange]],
  ["signatureRadiusBonusOnline", [SignatureSuppressor]],
  ["structureEnergyNeutralizerFalloff", [EnergyNeutralizer]],
  ["structureModuleEffectECM", [Ecm]],
  ["structureModuleEffectStasisWebifier", [StasisWebifier]],
  ["structureRepair", [HullRepairer]],
  ["structureWarpScrambleBlockMWDWithNPCEffect", [WarpScrambler]],
  ["superWeaponAmarr", [Doomsday]],
  ["superWeaponCaldari", [Doomsday]],
  ["superWeaponGallente", [Doomsday]],
  ["superWeaponMinmatar", [Doomsday]],
  ["targetAttack", [Turret]],
  ["targetDisintegratorAttack", [Turret]],
  ["tractorBeamCan", [TractorBeam]],
  ["useMissiles", [Missile]],
  ["warpDisrupt", [WarpScrambler]],
  ["warpDisruptSphere", [ActivationRange]],
  ["warpScrambleBlockMWDWithNPCEffect", [WarpScrambler]],
]);

/** Tooltip lines of a group, in place of those from its effects. */
const groupLines = new Map<string, ComponentType<LineProps>[]>([
  ["Breacher Pod Launchers", [BreacherPodLauncher]],
  ["Citizen Mining Laser", [MiningRange]],
  ["Flex Armor Hardener", []],
  ["Flex Shield Hardener", []],
  ["Gang Coordinator", [CommandBonus]],
  ["Scan Probe Launcher", [ProbeLauncher]],
  ["Stasis Grappler", [ActivationRange]],
  ["Structure Disruption Battery", [ActivationRange]],
  ["Survey Probe Launcher", [ProbeLauncher]],
]);

/** Tooltip lines of a type, in place of those from its group. */
const typeLines = new Map<string, ComponentType<LineProps>[]>([
  ["Standup Remote Sensor Dampener I", [SensorBooster]],
  ["Standup Target Painter I", [TargetPainter]],
  ["Standup Weapon Disruptor I", [WeaponDisruptor]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines(props: LineProps) {
  const sde = useSde();
  const type = useType(props.typeId);
  const shown = new Set(
    typeLines.get(type?.name ?? "") ??
      groupLines.get(sde.group(type?.groupId ?? 0)?.name ?? "") ??
      [...(type?.effectIds ?? [])].flatMap((id) => lines.get(sde.effect(id)?.name ?? "") ?? []),
  );
  return [...shown].map((Line, index) => <Line key={index} {...props} />);
}
