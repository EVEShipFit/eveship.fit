import type { Fit } from "@eveshipfit/fitting";

/** The part of the Web Storage API this needs; `localStorage` by default. */
export type FitStorage = Pick<Storage, "getItem" | "setItem">;

const DEFAULT_KEY = "eveshipfit.fits";

/**
 * Fits saved in the browser. A fit is known by its ship and name: saving
 * one with the same pair again overwrites it.
 */
export class LocalFits {
  readonly #storage: FitStorage;
  readonly #key: string;
  readonly #listeners = new Set<() => void>();
  #fits: readonly Fit[];

  constructor(storage: FitStorage = localStorage, key = DEFAULT_KEY) {
    this.#storage = storage;
    this.#key = key;
    this.#fits = this.#read();
  }

  list = (): readonly Fit[] => this.#fits;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  save(fit: Fit) {
    const index = this.#fits.findIndex((saved) => sameFit(saved, fit));
    this.#write(index === -1 ? [...this.#fits, fit] : this.#fits.with(index, fit));
  }

  remove(fit: Fit) {
    this.#write(this.#fits.filter((saved) => !sameFit(saved, fit)));
  }

  #read(): readonly Fit[] {
    const stored = this.#storage.getItem(this.#key);
    if (stored === null) return [];
    try {
      const fits: unknown = JSON.parse(stored);
      return Array.isArray(fits) ? (fits as Fit[]) : [];
    } catch {
      return [];
    }
  }

  #write(fits: readonly Fit[]) {
    this.#fits = fits;
    this.#storage.setItem(this.#key, JSON.stringify(fits));
    for (const listener of this.#listeners) listener();
  }
}

function sameFit(a: Fit, b: Fit): boolean {
  return a.ship.type_id === b.ship.type_id && a.name === b.name;
}
