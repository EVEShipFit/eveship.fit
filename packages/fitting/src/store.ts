import type { Sde } from "@eveshipfit/sde-loader";

import * as edits from "./edits.js";
import type { Stats } from "./stats.js";
import type { Character, Fit, ItemRef, Slot, State } from "./types.js";

export interface Snapshot {
  /** Without `character`; who flies the fit is set on the store. */
  readonly fit: Fit;
  readonly stats: Stats;
}

export interface Preview {
  readonly before: Snapshot;
  readonly after: Snapshot;
}

export interface Calculator {
  readonly sde: Sde;
  calculate(fit: Fit, character: Character): Stats;
}

const HISTORY_LIMIT = 100;

/**
 * A fit that recalculates itself on every change. `subscribe` and
 * `getSnapshot` are bound, so they can go straight into `useSyncExternalStore`.
 */
export class FitStore {
  readonly #calculator: Calculator;
  #character: Character;
  #snapshot: Snapshot;
  readonly #undo: Fit[] = [];
  readonly #redo: Fit[] = [];
  readonly #listeners = new Set<() => void>();

  constructor(calculator: Calculator, fit: Fit, character: Character) {
    this.#calculator = calculator;
    this.#character = character;
    this.#snapshot = this.#calculate(withoutCharacter(fit));
  }

  getSnapshot = (): Snapshot => this.#snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  get character(): Character {
    return this.#character;
  }

  get canUndo(): boolean {
    return this.#undo.length > 0;
  }

  get canRedo(): boolean {
    return this.#redo.length > 0;
  }

  /** Picks the rack and the first free slot, unless `slot` says where. */
  fit(typeId: number, slot?: Slot): ItemRef | undefined {
    const { fit, ref } = edits.fitType(this.#calculator.sde, this.#snapshot.fit, this.#snapshot.stats, typeId, slot);
    this.#commit(fit);
    return ref;
  }

  remove(ref: ItemRef) {
    this.#commit(edits.remove(this.#snapshot.fit, ref));
  }

  setState(ref: ItemRef, state: State) {
    this.#commit(edits.setState(this.#snapshot.fit, ref, state));
  }

  setCharge(ref: ItemRef, chargeTypeId: number | undefined) {
    this.#commit(edits.setCharge(this.#snapshot.fit, ref, chargeTypeId));
  }

  setQuantity(ref: ItemRef, quantity: number) {
    this.#commit(edits.setQuantity(this.#snapshot.fit, ref, quantity));
  }

  setName(name: string) {
    this.#commit(edits.setName(this.#snapshot.fit, name));
  }

  /** Swap in another fit entirely, like an import; undo brings the old one back. */
  replace(fit: Fit) {
    this.#commit(withoutCharacter(fit));
  }

  /** Who flies the fit is not an edit of it, so this does not go in the history. */
  setCharacter(character: Character) {
    this.#character = character;
    this.#publish(this.#calculate(this.#snapshot.fit));
  }

  undo() {
    const fit = this.#undo.pop();
    if (fit === undefined) return;
    this.#redo.push(this.#snapshot.fit);
    this.#publish(this.#calculate(fit));
  }

  redo() {
    const fit = this.#redo.pop();
    if (fit === undefined) return;
    this.#undo.push(this.#snapshot.fit);
    this.#publish(this.#calculate(fit));
  }

  /** What `edit` would do, without doing it. */
  preview(edit: (fit: FitStore) => void): Preview {
    const draft = new FitStore(this.#calculator, this.#snapshot.fit, this.#character);
    edit(draft);
    return { before: this.#snapshot, after: draft.getSnapshot() };
  }

  #commit(fit: Fit) {
    if (fit === this.#snapshot.fit) return;

    this.#undo.push(this.#snapshot.fit);
    if (this.#undo.length > HISTORY_LIMIT) this.#undo.shift();
    this.#redo.length = 0;
    this.#publish(this.#calculate(fit));
  }

  #calculate(fit: Fit): Snapshot {
    return Object.freeze({ fit, stats: this.#calculator.calculate(fit, this.#character) });
  }

  #publish(snapshot: Snapshot) {
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) listener();
  }
}

function withoutCharacter({ character: _, ...fit }: Fit): Fit {
  return fit;
}
