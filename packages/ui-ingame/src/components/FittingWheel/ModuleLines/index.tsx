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
import { GuidanceDisruptor, TrackingDisruptor, WeaponDisruptor } from "./Disruptor";
import { BurstJammer, Ecm, StructureEcm } from "./Ecm";
import { EnergyNeutralizer, EnergyNosferatu, StructureEnergyNeutralizer } from "./EnergyWarfare";
import { MaxVelocity } from "./MaxVelocity";
import { Mining } from "./Mining";
import { Launcher, Missile } from "./Missile";
import { ProbeLauncher } from "./ProbeLauncher";
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
import { DamageControl, Resistance } from "./Resistance";
import { ResistanceBonus } from "./ResistanceBonus";
import { RemoteSensorBooster, SensorBooster, StructureSensorDampener } from "./SensorBooster";
import { CargoScanner, ShipScanner } from "./ShipScanner";
import { SignatureSuppressor, StructureTargetPainter, TargetPainter } from "./SignatureRadius";
import { Doomsday, PointDefense, Smartbomb } from "./Smartbomb";
import { StasisGrappler, StasisWebifier } from "./StasisWebifier";
import { RemoteTrackingComputer, TrackingComputer } from "./TrackingComputer";
import { TractorBeam } from "./TractorBeam";
import { Turret, VortonProjector } from "./Turret";
import { WarpDisruptionFieldGenerator, WarpScrambler } from "./WarpScrambler";

export interface LineProps {
  itemRef: ItemRef;
  typeId: number;
  state: SlotState;
}

const lines = new Map<string, ComponentType<LineProps>[]>([
  ["adaptiveArmorHardener", [Resistance]],
  ["armorRepair", [ArmorRepairer]],
  ["cargoScan", [CargoScanner]],
  ["ChainLightning", [VortonProjector]],
  ["cloaking", [Cloak]],
  ["cloakingPrototype", [Cloak]],
  ["cloakingWarpSafe", [Cloak]],
  ["damageControl", [DamageControl]],
  ["debuffLance", [Doomsday]],
  ["doHacking", [ActivationRange]],
  ["doomsdayBeamDOT", [Doomsday]],
  ["doomsdayConeDOT", [Doomsday]],
  ["doomsdaySlash", [Doomsday]],
  ["ECMBurstJammer", [BurstJammer]],
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
  ["remoteSensorBoostFalloff", [RemoteSensorBooster]],
  ["remoteSensorDampFalloff", [RemoteSensorBooster]],
  ["remoteTargetPaintFalloff", [TargetPainter]],
  ["remoteWebifierFalloff", [StasisWebifier]],
  ["salvaging", [ActivationRange]],
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
  ["structureEnergyNeutralizerFalloff", [StructureEnergyNeutralizer]],
  ["structureModuleEffectECM", [StructureEcm]],
  ["structureModuleEffectRemoteSensorDampener", [StructureSensorDampener]],
  ["structureModuleEffectStasisWebifier", [StasisWebifier]],
  ["structureModuleEffectTargetPainter", [StructureTargetPainter]],
  ["structureModuleEffectWeaponDisruption", [WeaponDisruptor]],
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
  ["warpDisruptSphere", [WarpDisruptionFieldGenerator]],
  ["warpScrambleBlockMWDWithNPCEffect", [WarpScrambler]],
]);

/** Tooltip lines of a group, in place of those from its effects. */
const groupLines = new Map<string, ComponentType<LineProps>[]>([
  ["Breacher Pod Launchers", [BreacherPodLauncher]],
  ["Festival Launcher", [Launcher]],
  ["Flex Armor Hardener", []],
  ["Flex Shield Hardener", []],
  ["Gang Coordinator", [CommandBonus]],
  ["Interdiction Sphere Launcher", [Launcher]],
  ["Missile Launcher Bomb", [Launcher]],
  ["Missile Launcher Defender", [Launcher]],
  ["Scan Probe Launcher", [ProbeLauncher]],
  ["Stasis Grappler", [StasisGrappler]],
  ["Survey Probe Launcher", [ProbeLauncher]],
]);

/** Tooltip lines from the effects of a module. */
export function ModuleLines(props: LineProps) {
  const sde = useSde();
  const type = useType(props.typeId);
  const shown = new Set(
    groupLines.get(sde.group(type?.groupId ?? 0)?.name ?? "") ??
      [...(type?.effectIds ?? [])].flatMap((id) => lines.get(sde.effect(id)?.name ?? "") ?? []),
  );
  return [...shown].map((Line, index) => <Line key={index} {...props} />);
}
