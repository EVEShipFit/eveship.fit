import { ByteBuffer, Encoding } from "flatbuffers";

import { Names as RawNames } from "./generated/names/eve.js";
import { readSource, type Source } from "./source.js";

/** The name of every type in every language EVE supports; the other way round from `Sde.type()`. */
export class Names {
  readonly bytes: Uint8Array;
  readonly buildNumber: number;

  readonly #raw: RawNames;
  readonly #encoder = new TextEncoder();

  constructor(bytes: Uint8Array) {
    const buffer = new ByteBuffer(bytes);
    if (!RawNames.bufferHasIdentifier(buffer)) {
      throw new Error("Not a names file: the file identifier is not ESFN");
    }

    this.bytes = bytes;
    this.#raw = RawNames.getRootAsNames(buffer);
    this.buildNumber = this.#raw.buildNumber();
  }

  /** Case-insensitive, in any language. */
  typeId(name: string): number | undefined {
    // The file is sorted on UTF-8 bytes, which JavaScript's UTF-16 string order does not always agree with.
    const key = this.#encoder.encode(name.toLowerCase());

    let low = 0;
    let high = this.#raw.namesLength() - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const entry = this.#raw.names(middle, Encoding.UTF8_BYTES);
      if (!(entry instanceof Uint8Array)) throw new Error(`Corrupt names file: entry ${middle} is missing`);

      const order = compareBytes(entry, key);
      if (order < 0) low = middle + 1;
      else if (order > 0) high = middle - 1;
      else return this.#raw.typeIds(middle) ?? undefined;
    }
    return undefined;
  }
}

export async function loadNames(source: Source): Promise<Names> {
  return new Names(await readSource(source));
}

function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) return a[i]! - b[i]!;
  }
  return a.length - b.length;
}
