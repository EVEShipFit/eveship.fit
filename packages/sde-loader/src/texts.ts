import { ByteBuffer } from "flatbuffers";

import { Texts as RawTexts, type DogmaAttributeText } from "./generated/texts/eve.js";
import { toDate } from "./records.js";
import { readSource, type Source } from "./source.js";
import { Table } from "./table.js";

export interface SdeTooltip {
  readonly title: string | undefined;
  readonly description: string | undefined;
}

/** Text only a user interface shows, in English. */
export class Texts {
  readonly bytes: Uint8Array;
  readonly buildNumber: number;
  /** Missing from files before `@eveshipfit/sde` 8.3542233.1. */
  readonly releaseDate: Date | undefined;

  readonly #attributeTooltips: Table<DogmaAttributeText, SdeTooltip>;

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
  }

  /** What EVE shows when hovering the attribute; most attributes have none. */
  attributeTooltip(attributeId: number): SdeTooltip | undefined {
    return this.#attributeTooltips.get(attributeId);
  }
}

export async function loadTexts(source: Source): Promise<Texts> {
  return new Texts(await readSource(source));
}

function toTooltip(raw: DogmaAttributeText): SdeTooltip {
  return Object.freeze({ title: raw.tooltipTitle() || undefined, description: raw.tooltipDescription() || undefined });
}
