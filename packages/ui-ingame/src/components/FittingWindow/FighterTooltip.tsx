import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useSde, useType } from "@eveshipfit/react-hooks";
import type { SdeFighterAbility } from "@eveshipfit/sde-loader";

import { Attribute } from "../FittingWheel/ModuleLines/parts/Attribute";
import { EffectRange } from "../FittingWheel/ModuleLines/parts/EffectRange";
import { TypeRow } from "../FittingWheel/ModuleTooltip";
import styles from "../FittingWheel/ModuleTooltip.module.css";
import { damagePerSecond, range, unit } from "../ShipStatistics/units";

/** The damage per second of one fighter, by the effect of its ability. */
const abilityDamage = new Map([
  ["fighterAbilityAttackM", "fighterAbilityAttackMissileDamagePerSecond"],
  ["fighterAbilityMissiles", "fighterAbilityMissilesDamagePerSecond"],
]);

/** What EVE shows when hovering a squadron; the abilities of the first and third slot. */
export function FighterTooltip({ itemRef, typeId, quantity }: { itemRef: ItemRef; typeId: number; quantity: number }) {
  const type = useType(typeId);
  const targetRange = useAttribute("maxTargetRange", { of: itemRef, decimals: 0, format: range });
  const scanResolution = useAttribute("scanResolution", { of: itemRef, decimals: 1, fixed: true, format: unit(" mm") });
  const signatureRadius = useAttribute("signatureRadius", {
    of: itemRef,
    decimals: 1,
    fixed: true,
    format: unit(" m"),
  });

  return (
    <span className={styles.tooltip}>
      <TypeRow typeId={typeId} count={quantity > 1 ? `${quantity}x` : undefined} />
      {type?.fighterAbilities
        .filter(({ slot }) => slot !== 1)
        .map((ability) => (
          <AbilityLines key={ability.slot} itemRef={itemRef} ability={ability} quantity={quantity} />
        ))}
      <Attribute name="maxTargetRange">Maximum Targeting Range: {targetRange.text}</Attribute>
      <Attribute name="scanResolution">Scan Resolution: {scanResolution.text}</Attribute>
      <Attribute name="signatureRadius">Signature Radius: {signatureRadius.text}</Attribute>
    </span>
  );
}

function AbilityLines({
  itemRef,
  ability,
  quantity,
}: {
  itemRef: ItemRef;
  ability: SdeFighterAbility;
  quantity: number;
}) {
  const sde = useSde();
  const { name = "", effectId } = sde.fighterAbility(ability.abilityId) ?? {};
  if (effectId === undefined) return null;
  const damage = abilityDamage.get(sde.effect(effectId)?.name ?? "");

  return (
    <>
      {damage !== undefined && <AbilityDamage itemRef={itemRef} name={name} damage={damage} quantity={quantity} />}
      <EffectRange itemRef={itemRef} effectId={effectId} label="Optimal range" falloffLabel="Falloff range" />
    </>
  );
}

function AbilityDamage({
  itemRef,
  name,
  damage,
  quantity,
}: {
  itemRef: ItemRef;
  name: string;
  damage: string;
  quantity: number;
}) {
  const dps = useAttribute(damage, {
    of: itemRef,
    decimals: 1,
    fixed: true,
    fallback: 0,
    format: (value, format) => damagePerSecond(value * quantity, format),
  });

  return (
    <Attribute name="damageMultiplier">
      {name} - Damage Per Second {dps.text}
    </Attribute>
  );
}
