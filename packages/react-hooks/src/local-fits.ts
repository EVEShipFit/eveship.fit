import type { Fit } from "@eveshipfit/fitting";

export interface LocalFitsOptions {
  /** `indexedDB` when left out. */
  factory?: IDBFactory;
  /** The database name, also the channel other tabs hear changes on. */
  name?: string;
}

const STORE = "fits";

/**
 * Fits saved in the browser, in IndexedDB. A fit is known by its ship and name: saving
 * one with the same pair again overwrites it.
 */
export class LocalFits {
  readonly #db: Promise<IDBDatabase>;
  readonly #channel: BroadcastChannel;
  readonly #listeners = new Set<() => void>();
  #fits: readonly Fit[] = [];
  #reads = 0;

  constructor({ factory = indexedDB, name = "eveshipfit" }: LocalFitsOptions = {}) {
    const request = factory.open(name, 1);
    request.addEventListener("upgradeneeded", () => request.result.createObjectStore(STORE));
    this.#db = result(request);
    this.#channel = new BroadcastChannel(name);
    this.#channel.addEventListener("message", () => void this.#reload());
    void this.#reload();
  }

  list = (): readonly Fit[] => this.#fits;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  save(fit: Fit): Promise<void> {
    const index = this.#fits.findIndex((saved) => sameFit(saved, fit));
    void navigator.storage?.persist?.();
    return this.#change(index === -1 ? [...this.#fits, fit] : this.#fits.with(index, fit), (store) =>
      store.put(fit, key(fit)),
    );
  }

  remove(fit: Fit): Promise<void> {
    return this.#change(
      this.#fits.filter((saved) => !sameFit(saved, fit)),
      (store) => store.delete(key(fit)),
    );
  }

  /** Stops listening to other tabs and closes the database. */
  async close() {
    this.#channel.close();
    (await this.#db).close();
  }

  async #change(fits: readonly Fit[], write: (store: IDBObjectStore) => void) {
    this.#reads++;
    this.#publish(fits);
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
    const db = await this.#db;
    const fits = await result<Fit[]>(db.transaction(STORE).objectStore(STORE).getAll());
    if (read === this.#reads) this.#publish(fits);
  }

  #publish(fits: readonly Fit[]) {
    this.#fits = fits;
    for (const listener of this.#listeners) listener();
  }
}

function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function key(fit: Fit): [number, string] {
  return [fit.ship.type_id, fit.name ?? ""];
}

function sameFit(a: Fit, b: Fit): boolean {
  return a.ship.type_id === b.ship.type_id && (a.name ?? "") === (b.name ?? "");
}
