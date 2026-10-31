import type { Fit } from "@eveshipfit/fitting";

export interface LocalFitsOptions {
  /** `indexedDB` when left out. */
  factory?: IDBFactory;
  /** The database name, also the channel other tabs hear changes on. */
  name?: string;
}

/** Who a fit belongs to: the browser, or a logged-in character by its ID. */
export type FitOwner = "browser" | number;

interface Entry {
  key: IDBValidKey;
  fit: Fit;
}

const STORE = "fits";
const noFits: readonly Fit[] = [];

/** Fits kept in IndexedDB: the browser's by ship and name, a character's by ESI fitting ID. */
export class LocalFits {
  readonly #db: Promise<IDBDatabase>;
  readonly #channel: BroadcastChannel;
  readonly #listeners = new Set<() => void>();
  #entries: readonly Entry[] = [];
  #lists = new Map<FitOwner, readonly Fit[]>();
  #reads = 0;

  constructor({ factory, name = "eveshipfit" }: LocalFitsOptions = {}) {
    this.#db = openDatabase(factory, name);
    this.#db.catch((error: unknown) => console.error(error));
    this.#channel = new BroadcastChannel(name);
    this.#channel.addEventListener("message", () => void this.#reload());
    void this.#reload();
  }

  /** The fits of `owner`; the browser's when left out. */
  list = (owner: FitOwner = "browser"): readonly Fit[] => this.#lists.get(owner) ?? noFits;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** Saves the fit in the browser. */
  save(fit: Fit): Promise<void> {
    const key = browserKey(fit);
    const index = this.#entries.findIndex((entry) => same(entry.key, key));
    void navigator.storage?.persist?.();
    return this.#change(
      index === -1 ? [...this.#entries, { key, fit }] : this.#entries.with(index, { key, fit }),
      (store) => store.put(fit, key),
    );
  }

  /** Removes the fit from the browser. */
  remove(fit: Fit): Promise<void> {
    const key = browserKey(fit);
    return this.#change(
      this.#entries.filter((entry) => !same(entry.key, key)),
      (store) => store.delete(key),
    );
  }

  /** Replaces all fits of the character with `fits`, by ESI fitting ID. */
  setCharacterFits(characterId: number, fits: ReadonlyMap<number, Fit>): Promise<void> {
    const added = [...fits]
      .toSorted(([a], [b]) => a - b)
      .map(([fittingId, fit]) => ({ key: [characterId, fittingId], fit }));
    return this.#change([...this.#entries.filter((entry) => ownerOf(entry.key) !== characterId), ...added], (store) => {
      for (const { key, fit } of added) store.put(fit, key);
      const keys = store.getAllKeys();
      keys.addEventListener("success", () => {
        for (const key of keys.result) {
          if (ownerOf(key) === characterId && !fits.has((key as [number, number])[1])) store.delete(key);
        }
      });
    });
  }

  /** Stops listening to other tabs and closes the database. */
  async close() {
    this.#channel.close();
    (await this.#db.catch(() => undefined))?.close();
  }

  async #change(entries: readonly Entry[], write: (store: IDBObjectStore) => void) {
    this.#reads++;
    this.#publish(entries);
    const tx = (await this.#db).transaction(STORE, "readwrite");
    write(tx.objectStore(STORE));
    void this.#reload();
    await new Promise<void>((resolve, reject) => {
      tx.addEventListener("complete", () => resolve());
      tx.addEventListener("error", () => reject(tx.error));
      tx.addEventListener("abort", () => reject(tx.error));
    });
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- A BroadcastChannel has no target origin.
    this.#channel.postMessage(null);
  }

  async #reload() {
    const read = ++this.#reads;
    const db = await this.#db.catch(() => undefined);
    if (db === undefined) return;
    const store = db.transaction(STORE).objectStore(STORE);
    const [keys, fits] = await Promise.all([result(store.getAllKeys()), result<Fit[]>(store.getAll())]);
    if (read === this.#reads) this.#publish(keys.map((key, index) => ({ key, fit: fits[index]! })));
  }

  #publish(entries: readonly Entry[]) {
    this.#entries = entries;
    this.#lists = new Map(
      [...Map.groupBy(entries, (entry) => ownerOf(entry.key))].map(([owner, owned]) => [
        owner,
        owned.map((entry) => entry.fit),
      ]),
    );
    for (const listener of this.#listeners) listener();
  }
}

async function openDatabase(factory: IDBFactory = indexedDB, name: string): Promise<IDBDatabase> {
  const request = factory.open(name, 1);
  request.addEventListener("upgradeneeded", () => request.result.createObjectStore(STORE));
  return result(request);
}

function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function browserKey(fit: Fit): IDBValidKey {
  return ["browser", fit.ship.type_id, fit.name ?? ""];
}

function same(a: IDBValidKey, b: IDBValidKey): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function ownerOf(key: IDBValidKey): FitOwner {
  return (key as [FitOwner])[0];
}
