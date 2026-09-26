import type { Sde, SdeType } from "@eveshipfit/sde-loader";

/** A type's value for an attribute as the SDE has it, before any effect applies. */
export function baseValue(sde: Sde, type: SdeType, name: string): number | undefined {
  const id = sde.attributeId(name);
  return id === undefined ? undefined : type.attributes.get(id);
}

/** Every value of a numbered attribute family, like `chargeGroup1` to `chargeGroup5`. */
export function baseValues(sde: Sde, type: SdeType, names: readonly string[]): number[] {
  const values: number[] = [];
  for (const name of names) {
    const value = baseValue(sde, type, name);
    if (value !== undefined) values.push(value);
  }
  return values;
}
