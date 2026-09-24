interface Keyed {
  id(): number;
}

/**
 * A flatbuffer vector sorted on its `id` key. Records are decoded on first
 * lookup and cached; a miss is cached too.
 */
export class Table<Raw extends Keyed, Record> {
  readonly #length: number;
  readonly #at: (index: number) => Raw;
  readonly #decode: (raw: Raw) => Record;
  readonly #cache = new Map<number, Record | undefined>();

  constructor(length: number, at: (index: number) => Raw | null, decode: (raw: Raw) => Record) {
    this.#length = length;
    this.#at = (index) => at(index)!;
    this.#decode = decode;
  }

  get(id: number): Record | undefined {
    if (this.#cache.has(id)) return this.#cache.get(id);

    const index = this.#indexOf(id);
    const record = index === -1 ? undefined : this.#decode(this.#at(index));
    this.#cache.set(id, record);
    return record;
  }

  /** Every record, in key order. */
  *all(): Generator<Record> {
    for (let index = 0; index < this.#length; index++) {
      const raw = this.#at(index);
      const id = raw.id();
      let record = this.#cache.get(id);
      if (record === undefined) {
        record = this.#decode(raw);
        this.#cache.set(id, record);
      }
      yield record;
    }
  }

  #indexOf(id: number): number {
    let low = 0;
    let high = this.#length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const key = this.#at(middle).id();
      if (key < id) low = middle + 1;
      else if (key > id) high = middle - 1;
      else return middle;
    }
    return -1;
  }
}
