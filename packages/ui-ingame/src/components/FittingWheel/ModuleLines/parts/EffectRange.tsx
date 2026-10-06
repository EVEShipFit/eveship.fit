import type { ItemRef } from "@eveshipfit/fitting";
import { useSde } from "@eveshipfit/react-hooks";

import { Range } from "./Range";

/** The falloff EVE shows for an effect, where it is not the one the effect names. */
const falloffOverrides = new Map<string, string | undefined>([
  ["shipModuleAncillaryRemoteArmorRepairer", undefined],
  ["shipScan", undefined],
  ["structureEnergyNeutralizerFalloff", undefined],
  ["structureModuleEffectECM", undefined],
  ["structureModuleEffectRemoteSensorDampener", undefined],
  ["structureModuleEffectTargetPainter", undefined],
  ["structureModuleEffectWeaponDisruption", undefined],
  ["targetDisintegratorAttack", "falloff"],
]);

/** The range of an effect, by the attributes the effect names for it. */
export function EffectRange({
  itemRef,
  effectId,
  label = "Range",
  falloffLabel,
}: {
  itemRef: ItemRef;
  effectId: number;
  label?: string;
  falloffLabel?: string;
}) {
  const sde = useSde();
  const effect = sde.effect(effectId);
  const optimal = sde.attribute(effect?.rangeAttributeId ?? 0)?.name;
  if (effect === undefined || optimal === undefined) return null;
  const falloff = falloffOverrides.has(effect.name)
    ? falloffOverrides.get(effect.name)
    : sde.attribute(effect.falloffAttributeId ?? 0)?.name;

  return <Range itemRef={itemRef} optimal={optimal} falloff={falloff} label={label} falloffLabel={falloffLabel} />;
}
