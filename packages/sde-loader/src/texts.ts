import { ByteBuffer } from "flatbuffers";

import { Texts as RawTexts, type DogmaAttributeText, type TypeBonus, type TypeBonuses } from "./generated/texts/eve.js";
import { toDate } from "./records.js";
import { readSource, type Source } from "./source.js";
import { Table } from "./table.js";

export interface SdeTooltip {
  readonly title: string | undefined;
  readonly description: string | undefined;
}

export interface SdeTypeBonus {
  readonly bonus: number | undefined;
  readonly unitId: number;
  /** With EVE's markup: `<a href=showinfo:…>`, `<b>`, `<u>` and `<i>`. */
  readonly text: string;
}

export interface SdeSkillBonuses {
  readonly skillTypeId: number;
  readonly bonuses: readonly SdeTypeBonus[];
}

/** The bonuses EVE shows when hovering a ship, each list in the order EVE shows it. */
export interface SdeTypeBonuses {
  readonly skills: readonly SdeSkillBonuses[];
  readonly role: readonly SdeTypeBonus[];
  readonly misc: readonly SdeTypeBonus[];
}

/** Text only a user interface shows, in English. */
export class Texts {
  readonly bytes: Uint8Array;
  readonly buildNumber: number;
  /** Missing from files before `@eveshipfit/sde` 8.3542233.1. */
  readonly releaseDate: Date | undefined;

  readonly #attributeTooltips: Table<DogmaAttributeText, SdeTooltip>;
  readonly #typeBonuses: Table<TypeBonuses, SdeTypeBonuses>;

  constructor(bytes: Uint8Array) {
    const buffer = new ByteBuffer(bytes);
    if (!RawTexts.bufferHasIdentifier(buffer)) {
      throw new Error("Not a texts file: the file identifier is not ESFT");
    }

    const raw = RawTexts.getRootAsTexts(buffer);
    this.bytes = bytes;
    this.buildNumber = raw.buildNumber();
    this.releaseDate = toDate(raw.releaseDate());
    this.#attributeTooltips = new Table(raw.dogmaAttributesLength(), (i) => raw.dogmaAttributes(i), toTooltip);
    this.#typeBonuses = new Table(raw.typeBonusesLength(), (i) => raw.typeBonuses(i), toTypeBonuses);
  }

  /** What EVE shows when hovering the attribute; most attributes have none. */
  attributeTooltip(attributeId: number): SdeTooltip | undefined {
    return this.#attributeTooltips.get(attributeId);
  }

  /** Missing from files before `@eveshipfit/sde` 14. */
  typeBonuses(typeId: number): SdeTypeBonuses | undefined {
    return this.#typeBonuses.get(typeId);
  }
}

export async function loadTexts(source: Source): Promise<Texts> {
  return new Texts(await readSource(source));
}

function toTooltip(raw: DogmaAttributeText): SdeTooltip {
  return Object.freeze({ title: raw.tooltipTitle() || undefined, description: raw.tooltipDescription() || undefined });
}

function toTypeBonuses(raw: TypeBonuses): SdeTypeBonuses {
  const skills = Array.from({ length: raw.skillsLength() }, (_, i) => {
    const skill = raw.skills(i)!;
    return Object.freeze({
      skillTypeId: skill.skillTypeId(),
      bonuses: toBonusList(skill.bonusesLength(), (j) => skill.bonuses(j)!),
    });
  });
  return Object.freeze({
    skills: Object.freeze(skills),
    role: toBonusList(raw.roleBonusesLength(), (i) => raw.roleBonuses(i)!),
    misc: toBonusList(raw.miscBonusesLength(), (i) => raw.miscBonuses(i)!),
  });
}

function toBonusList(length: number, at: (index: number) => TypeBonus): readonly SdeTypeBonus[] {
  return Object.freeze(
    Array.from({ length }, (_, i) => {
      const bonus = at(i);
      return Object.freeze({ bonus: bonus.bonus() ?? undefined, unitId: bonus.unitId(), text: bonus.text()! });
    }),
  );
}
