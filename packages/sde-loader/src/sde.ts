import { ByteBuffer } from "flatbuffers";

import {
  Sde as RawSde,
  type Category,
  type DogmaAttribute,
  type DogmaEffect,
  type DogmaUnit,
  type Group,
  type MarketGroup,
  type MetaGroup,
  type Type,
} from "./generated/sde/eve.js";
import {
  SdeType,
  toAttribute,
  toCategory,
  toEffect,
  toGroup,
  toMarketGroup,
  toMetaGroup,
  toUnit,
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
import { buildMarketTree, buildShipTree, type MarketGroupNode, type ShipGroupNode } from "./trees.js";

export class Sde {
  readonly bytes: Uint8Array;
  readonly buildNumber: number;

  readonly #types: Table<Type, SdeType>;
  readonly #groups: Table<Group, SdeGroup>;
  readonly #categories: Table<Category, SdeCategory>;
  readonly #attributes: Table<DogmaAttribute, SdeAttribute>;
  readonly #effects: Table<DogmaEffect, SdeEffect>;
  readonly #marketGroups: Table<MarketGroup, SdeMarketGroup>;
  readonly #metaGroups: Table<MetaGroup, SdeMetaGroup>;
  readonly #units: Table<DogmaUnit, SdeUnit>;

  #attributeIds: Map<string, number> | undefined;
  #typesByName: Map<string, SdeType> | undefined;
  #marketTree: readonly MarketGroupNode[] | undefined;
  #shipTree: readonly ShipGroupNode[] | undefined;

  constructor(bytes: Uint8Array) {
    const buffer = new ByteBuffer(bytes);
    if (!RawSde.bufferHasIdentifier(buffer)) {
      throw new Error("Not an SDE file: the file identifier is not ESF1");
    }

    const raw = RawSde.getRootAsSde(buffer);
    this.bytes = bytes;
    this.buildNumber = raw.buildNumber();

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

  types(): Iterable<SdeType> {
    return this.#types.all();
  }

  groups(): Iterable<SdeGroup> {
    return this.#groups.all();
  }

  marketGroups(): Iterable<SdeMarketGroup> {
    return this.#marketGroups.all();
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
    this.#marketTree ??= buildMarketTree(this.#marketGroups.all(), this.#types.all());
    return this.#marketTree;
  }

  /** Published ships, by group and then race; everything sorted by name. */
  shipTree(): readonly ShipGroupNode[] {
    this.#shipTree ??= buildShipTree(this.#types.all(), (id) => this.group(id));
    return this.#shipTree;
  }
}

export async function loadSde(source: Source): Promise<Sde> {
  return new Sde(await readSource(source));
}
