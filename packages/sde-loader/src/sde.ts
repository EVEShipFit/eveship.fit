import { ByteBuffer } from "flatbuffers";

import {
  Sde as RawSde,
  type Category,
  type DogmaAttribute,
  type DogmaEffect,
  type DogmaUnit,
  type FighterAbility,
  type Group,
  type MarketGroup,
  type MetaGroup,
  type Type,
} from "./generated/sde/eve.js";
import {
  SdeType,
  toFighterAbility,
  toAttribute,
  toCategory,
  toDate,
  toEffect,
  toGroup,
  toMarketGroup,
  toMetaGroup,
  toUnit,
  type SdeFighterAbilityInfo,
  type SdeAttribute,
  type SdeCategory,
  type SdeEffect,
  type SdeGroup,
  type SdeMarketGroup,
  type SdeMetaGroup,
  type SdeUnit,
} from "./records.js";
import { readSource, type Source } from "./source.js";
import { Table } from "./table.js";
import {
  buildChargeSearch,
  buildChargeTree,
  buildMarketTree,
  buildModuleSearch,
  buildModuleTree,
  buildShipTree,
  HULL_CATEGORY_IDS,
  sortByMeta,
  type MarketGroupNode,
  type MetaLevel,
  type MetaSortedTypes,
  type ModuleGroupNode,
  type ShipGroupNode,
} from "./trees.js";

const MIN_MAJOR_VERSION = 12;

export class Sde {
  readonly bytes: Uint8Array;
  readonly buildNumber: number;
  /** Missing from files before `@eveshipfit/sde` 8.3542233.1. */
  readonly releaseDate: Date | undefined;

  readonly #types: Table<Type, SdeType>;
  readonly #groups: Table<Group, SdeGroup>;
  readonly #categories: Table<Category, SdeCategory>;
  readonly #attributes: Table<DogmaAttribute, SdeAttribute>;
  readonly #effects: Table<DogmaEffect, SdeEffect>;
  readonly #marketGroups: Table<MarketGroup, SdeMarketGroup>;
  readonly #metaGroups: Table<MetaGroup, SdeMetaGroup>;
  readonly #units: Table<DogmaUnit, SdeUnit>;
  readonly #fighterAbilities: Table<FighterAbility, SdeFighterAbilityInfo>;

  #attributeIds: Map<string, number> | undefined;
  #typesByName: Map<string, SdeType> | undefined;
  #marketTree: readonly MarketGroupNode[] | undefined;
  #moduleTree: readonly ModuleGroupNode[] | undefined;
  #moduleSearch: readonly ModuleGroupNode[] | undefined;
  #chargeTree: readonly MarketGroupNode[] | undefined;
  #chargeSearch: readonly ModuleGroupNode[] | undefined;
  #shipTree: readonly ShipGroupNode[] | undefined;

  constructor(bytes: Uint8Array) {
    const buffer = new ByteBuffer(bytes);
    if (!RawSde.bufferHasIdentifier(buffer)) {
      throw new Error("Not an SDE file: the file identifier is not ESF1");
    }

    const raw = RawSde.getRootAsSde(buffer);
    if (raw.majorVersion() < MIN_MAJOR_VERSION) {
      throw new Error(`Not a supported SDE file: needs @eveshipfit/sde ${MIN_MAJOR_VERSION} or newer`);
    }
    this.bytes = bytes;
    this.buildNumber = raw.buildNumber();
    this.releaseDate = toDate(raw.releaseDate());

    this.#types = new Table(
      raw.typesLength(),
      (i) => raw.types(i),
      (type) => new SdeType(type),
    );
    this.#groups = new Table(raw.groupsLength(), (i) => raw.groups(i), toGroup);
    this.#categories = new Table(raw.categoriesLength(), (i) => raw.categories(i), toCategory);
    this.#attributes = new Table(raw.dogmaAttributesLength(), (i) => raw.dogmaAttributes(i), toAttribute);
    this.#effects = new Table(raw.dogmaEffectsLength(), (i) => raw.dogmaEffects(i), toEffect);
    this.#marketGroups = new Table(raw.marketGroupsLength(), (i) => raw.marketGroups(i), toMarketGroup);
    this.#metaGroups = new Table(raw.metaGroupsLength(), (i) => raw.metaGroups(i), toMetaGroup);
    this.#units = new Table(raw.dogmaUnitsLength(), (i) => raw.dogmaUnits(i), toUnit);
    this.#fighterAbilities = new Table(raw.fighterAbilitiesLength(), (i) => raw.fighterAbilities(i), toFighterAbility);
  }

  type(id: number): SdeType | undefined {
    return this.#types.get(id);
  }

  group(id: number): SdeGroup | undefined {
    return this.#groups.get(id);
  }

  category(id: number): SdeCategory | undefined {
    return this.#categories.get(id);
  }

  attribute(id: number): SdeAttribute | undefined {
    return this.#attributes.get(id);
  }

  effect(id: number): SdeEffect | undefined {
    return this.#effects.get(id);
  }

  marketGroup(id: number): SdeMarketGroup | undefined {
    return this.#marketGroups.get(id);
  }

  metaGroup(id: number): SdeMetaGroup | undefined {
    return this.#metaGroups.get(id);
  }

  unit(id: number): SdeUnit | undefined {
    return this.#units.get(id);
  }

  fighterAbility(id: number): SdeFighterAbilityInfo | undefined {
    return this.#fighterAbilities.get(id);
  }

  types(): Iterable<SdeType> {
    return this.#types.all();
  }

  groups(): Iterable<SdeGroup> {
    return this.#groups.all();
  }

  marketGroups(): Iterable<SdeMarketGroup> {
    return this.#marketGroups.all();
  }

  /** Lowest ID first. */
  typesInGroup(id: number): SdeType[] {
    return this.#typesOf(this.#groups.raw(id)?.typeIdsArray());
  }

  /** By group, lowest ID first. */
  typesInCategory(id: number): SdeType[] {
    return [...this.#groups.all()]
      .filter((group) => group.categoryId === id)
      .flatMap((group) => this.typesInGroup(group.id));
  }

  /** Lowest ID first. */
  typesInMarketGroup(id: number): SdeType[] {
    return this.#typesOf(this.#marketGroups.raw(id)?.typeIdsArray());
  }

  #typesOf(ids: Int32Array | null | undefined): SdeType[] {
    return Array.from(ids ?? [], (id) => this.#types.get(id)!);
  }

  attributeId(name: string): number | undefined {
    if (this.#attributeIds === undefined) {
      this.#attributeIds = new Map();
      for (const attribute of this.#attributes.all()) {
        this.#attributeIds.set(attribute.name, attribute.id);
      }
    }
    return this.#attributeIds.get(name);
  }

  /** By exact English name. When names clash, a published type wins over an unpublished one. */
  typeByName(name: string): SdeType | undefined {
    if (this.#typesByName === undefined) {
      this.#typesByName = new Map();
      for (const type of this.#types.all()) {
        const existing = this.#typesByName.get(type.name);
        if (existing === undefined || (!existing.published && type.published)) {
          this.#typesByName.set(type.name, type);
        }
      }
    }
    return this.#typesByName.get(name);
  }

  /** The published market, root groups first; children and types sorted by name. */
  marketTree(): readonly MarketGroupNode[] {
    if (this.#marketTree === undefined) {
      const marketGroups = [...this.#marketGroups.all()];
      this.#marketTree = buildMarketTree(
        marketGroups,
        marketGroups.flatMap((group) => this.typesInMarketGroup(group.id)),
      );
    }
    return this.#marketTree;
  }

  /** What goes on a ship, by market group; types sorted by meta group, meta level and name. */
  moduleTree(): readonly ModuleGroupNode[] {
    this.#moduleTree ??= buildModuleTree(this.marketTree(), this.#metaLevel());
    return this.#moduleTree;
  }

  /** What can be fitted, by root market group; types sorted by name, faction, officer and deadspace ones in folders. */
  moduleSearch(): readonly ModuleGroupNode[] {
    this.#moduleSearch ??= buildModuleSearch(this.marketTree());
    return this.#moduleSearch;
  }

  /** Charges by market group, groups with groups in them first; types sorted by meta group, meta level and name. */
  chargeTree(): readonly MarketGroupNode[] {
    this.#chargeTree ??= buildChargeTree(this.marketTree(), this.#metaLevel());
    return this.#chargeTree;
  }

  /** Charges by root market group; types sorted by name, faction, officer and deadspace ones in folders. */
  chargeSearch(): readonly ModuleGroupNode[] {
    this.#chargeSearch ??= buildChargeSearch(this.marketTree());
    return this.#chargeSearch;
  }

  /** Sorted by meta group, meta level and name; faction, officer and deadspace types in folders, as in `moduleTree`. */
  sortByMeta(types: Iterable<SdeType>): MetaSortedTypes {
    return sortByMeta(types, this.#metaLevel());
  }

  #metaLevel(): MetaLevel {
    const metaLevel = this.attributeId("metaLevelOld");
    return (type) => (metaLevel === undefined ? undefined : type.attributes.get(metaLevel)) ?? 0;
  }

  /** Published ships and structures, by group and then race; hulls sorted by meta group, meta level and name. */
  shipTree(): readonly ShipGroupNode[] {
    this.#shipTree ??= buildShipTree(
      [...HULL_CATEGORY_IDS].flatMap((id) => this.typesInCategory(id)),
      (id) => this.group(id),
      this.#metaLevel(),
    );
    return this.#shipTree;
  }
}

export async function loadSde(source: Source): Promise<Sde> {
  return new Sde(await readSource(source));
}
