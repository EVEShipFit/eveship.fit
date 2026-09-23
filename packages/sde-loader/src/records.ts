import type {
  Category,
  DogmaAttribute,
  DogmaEffect,
  DogmaUnit,
  Group,
  MarketGroup,
  MetaGroup,
  Type,
} from "./generated/sde/eve.js";
import { EffectCategory as RawEffectCategory } from "./generated/sde/eve.js";

export interface SdeGroup {
  readonly id: number;
  readonly name: string;
  readonly categoryId: number;
  readonly published: boolean;
}

export interface SdeCategory {
  readonly id: number;
  readonly name: string;
  readonly published: boolean;
}

export interface SdeMarketGroup {
  readonly id: number;
  readonly name: string;
  readonly parentGroupId: number | undefined;
}

export interface SdeMetaGroup {
  readonly id: number;
  readonly name: string;
}

export interface SdeAttribute {
  readonly id: number;
  readonly name: string;
  readonly displayName: string | undefined;
  readonly defaultValue: number;
  readonly highIsGood: boolean;
  readonly stackable: boolean;
  readonly published: boolean;
  readonly unitId: number;
  readonly categoryId: number;
}

export interface SdeUnit {
  readonly id: number;
  readonly name: string;
  readonly displayName: string | undefined;
}

export type EffectCategory = "passive" | "active" | "target" | "area" | "online" | "overload" | "dungeon" | "system";

export interface SdeEffect {
  readonly id: number;
  readonly name: string;
  readonly displayName: string | undefined;
  readonly category: EffectCategory;
  readonly published: boolean;
  readonly isOffensive: boolean;
  readonly isAssistance: boolean;
  readonly dischargeAttributeId: number | undefined;
  readonly durationAttributeId: number | undefined;
  readonly rangeAttributeId: number | undefined;
  readonly falloffAttributeId: number | undefined;
  readonly trackingSpeedAttributeId: number | undefined;
}

export interface SdeFighterAbility {
  readonly slot: number;
  readonly abilityId: number;
  readonly cooldownSeconds: number;
  readonly chargeCount: number;
  readonly rearmTimeSeconds: number;
}

/**
 * A type from the SDE. The scalar fields are read up front; attributes,
 * effects and fighter abilities only when first asked for, as most lookups
 * never need them.
 */
export class SdeType {
  readonly id: number;
  readonly name: string;
  readonly groupId: number;
  readonly categoryId: number;
  readonly published: boolean;
  readonly factionId: number | undefined;
  readonly marketGroupId: number | undefined;
  readonly metaGroupId: number | undefined;
  readonly raceId: number | undefined;
  readonly capacity: number | undefined;
  readonly mass: number | undefined;
  readonly radius: number | undefined;
  readonly volume: number | undefined;

  readonly #raw: Type;
  #attributes: ReadonlyMap<number, number> | undefined;
  #effectIds: ReadonlySet<number> | undefined;
  #defaultEffectId: number | undefined | null = null;
  #fighterAbilities: readonly SdeFighterAbility[] | undefined;

  constructor(raw: Type) {
    this.#raw = raw;
    this.id = raw.id();
    this.name = raw.name() ?? "";
    this.groupId = raw.groupId();
    this.categoryId = raw.categoryId();
    this.published = raw.published();
    this.factionId = orUndefined(raw.factionId());
    this.marketGroupId = orUndefined(raw.marketGroupId());
    this.metaGroupId = orUndefined(raw.metaGroupId());
    this.raceId = orUndefined(raw.raceId());
    this.capacity = raw.capacity() ?? undefined;
    this.mass = raw.mass() ?? undefined;
    this.radius = raw.radius() ?? undefined;
    this.volume = raw.volume() ?? undefined;
  }

  /** Base values by attribute ID, before any effect applies. */
  get attributes(): ReadonlyMap<number, number> {
    if (this.#attributes === undefined) {
      const attributes = new Map<number, number>();
      for (let i = 0; i < this.#raw.dogmaAttributesLength(); i++) {
        const attribute = this.#raw.dogmaAttributes(i)!;
        attributes.set(attribute.attributeId(), attribute.value());
      }
      this.#attributes = attributes;
    }
    return this.#attributes;
  }

  get effectIds(): ReadonlySet<number> {
    this.#readEffects();
    return this.#effectIds!;
  }

  get defaultEffectId(): number | undefined {
    this.#readEffects();
    return this.#defaultEffectId ?? undefined;
  }

  get fighterAbilities(): readonly SdeFighterAbility[] {
    if (this.#fighterAbilities === undefined) {
      const abilities: SdeFighterAbility[] = [];
      for (let i = 0; i < this.#raw.fighterAbilitiesLength(); i++) {
        const ability = this.#raw.fighterAbilities(i)!;
        abilities.push({
          slot: ability.slot(),
          abilityId: ability.abilityId(),
          cooldownSeconds: ability.cooldownSeconds(),
          chargeCount: ability.chargeCount(),
          rearmTimeSeconds: ability.rearmTimeSeconds(),
        });
      }
      this.#fighterAbilities = abilities;
    }
    return this.#fighterAbilities;
  }

  #readEffects() {
    if (this.#effectIds !== undefined) return;

    const effectIds = new Set<number>();
    let defaultEffectId: number | undefined;
    for (let i = 0; i < this.#raw.dogmaEffectsLength(); i++) {
      const effect = this.#raw.dogmaEffects(i)!;
      effectIds.add(effect.effectId());
      if (effect.isDefault()) defaultEffectId = effect.effectId();
    }
    this.#effectIds = effectIds;
    this.#defaultEffectId = defaultEffectId;
  }
}

export function toGroup(raw: Group): SdeGroup {
  return Object.freeze({
    id: raw.id(),
    name: raw.name() ?? "",
    categoryId: raw.categoryId(),
    published: raw.published(),
  });
}

export function toCategory(raw: Category): SdeCategory {
  return Object.freeze({ id: raw.id(), name: raw.name() ?? "", published: raw.published() });
}

export function toMarketGroup(raw: MarketGroup): SdeMarketGroup {
  return Object.freeze({ id: raw.id(), name: raw.name() ?? "", parentGroupId: orUndefined(raw.parentGroupId()) });
}

export function toMetaGroup(raw: MetaGroup): SdeMetaGroup {
  return Object.freeze({ id: raw.id(), name: raw.name() ?? "" });
}

export function toAttribute(raw: DogmaAttribute): SdeAttribute {
  return Object.freeze({
    id: raw.id(),
    name: raw.name() ?? "",
    displayName: raw.displayName() || undefined,
    defaultValue: raw.defaultValue(),
    highIsGood: raw.highIsGood(),
    stackable: raw.stackable(),
    published: raw.published(),
    unitId: raw.unitId(),
    categoryId: raw.categoryId(),
  });
}

export function toUnit(raw: DogmaUnit): SdeUnit {
  return Object.freeze({ id: raw.id(), name: raw.name() ?? "", displayName: raw.displayName() || undefined });
}

const effectCategories: Record<RawEffectCategory, EffectCategory> = {
  [RawEffectCategory.Passive]: "passive",
  [RawEffectCategory.Active]: "active",
  [RawEffectCategory.Target]: "target",
  [RawEffectCategory.Area]: "area",
  [RawEffectCategory.Online]: "online",
  [RawEffectCategory.Overload]: "overload",
  [RawEffectCategory.Dungeon]: "dungeon",
  [RawEffectCategory.System]: "system",
};

export function toEffect(raw: DogmaEffect): SdeEffect {
  return Object.freeze({
    id: raw.id(),
    name: raw.name() ?? "",
    displayName: raw.displayName() || undefined,
    category: effectCategories[raw.effectCategory()],
    published: raw.published(),
    isOffensive: raw.isOffensive(),
    isAssistance: raw.isAssistance(),
    dischargeAttributeId: orUndefined(raw.dischargeAttributeId()),
    durationAttributeId: orUndefined(raw.durationAttributeId()),
    rangeAttributeId: orUndefined(raw.rangeAttributeId()),
    falloffAttributeId: orUndefined(raw.falloffAttributeId()),
    trackingSpeedAttributeId: orUndefined(raw.trackingSpeedAttributeId()),
  });
}

/** The SDE writes 0 for "none" in its ID fields. */
function orUndefined(id: number): number | undefined {
  return id === 0 ? undefined : id;
}
