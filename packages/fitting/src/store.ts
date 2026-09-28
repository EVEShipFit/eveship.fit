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

const HISTORY_LIMIT = 25;

/**
 * A fit that recalculates itself on every change. `subscribe` and
 * `getSnapshot` are bound, so they can go straight into `useSyncExternalStore`.
 */
export class FitStore {
  readonly #calculator: Calculator;
  #character: Character;
  #snapshot: Snapshot;
  /** Oldest first; an edit goes at the end, also after going back. */
  readonly #history: Fit[];
  #position: number;
  readonly #listeners = new Set<() => void>();

  constructor(calculator: Calculator, fit: Fit, character: Character) {
    this.#calculator = calculator;
    this.#character = character;
    this.#snapshot = this.#calculate(withoutCharacter(fit));
    this.#history = [this.#snapshot.fit];
    this.#position = 0;
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
    return this.#position > 0;
  }

  get canRedo(): boolean {
    return this.#position < this.#history.length - 1;
  }

  get historyLength(): number {
    return this.#history.length;
  }

  /** 0 is the oldest. */
  get historyPosition(): number {
    return this.#position;
  }

  /** Picks the rack and the first free slot, unless `slot` says where. */
  fit(typeId: number, slot?: Slot): ItemRef | undefined {
    const { fit, ref } = edits.fitType(this.#calculator.sde, this.#snapshot.fit, this.#snapshot.stats, typeId, slot);
    this.#commit(fit);
    return ref;
  }

  /** To another slot of the same rack, swapping places with what is there. */
  move(ref: ItemRef, slot: Slot) {
    this.#commit(edits.move(this.#snapshot.fit, ref, slot));
  }

  remove(...refs: ItemRef[]) {
    this.#commit(edits.remove(this.#snapshot.fit, ...refs));
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

  setActiveDrones(typeId: number, count: number) {
    this.#commit(edits.setActiveDrones(this.#snapshot.fit, typeId, count));
  }

  setDroneQuantity(typeId: number, quantity: number) {
    const { sde } = this.#calculator;
    this.#commit(edits.setDroneQuantity(sde, this.#snapshot.fit, this.#snapshot.stats, typeId, quantity));
  }

  setCargoQuantity(typeId: number, quantity: number) {
    this.#commit(edits.setCargoQuantity(this.#snapshot.fit, typeId, quantity));
  }

  setName(name: string) {
    this.#commit(edits.setName(this.#snapshot.fit, name));
  }

  /** Swap in another fit entirely, like an import. */
  replace(fit: Fit) {
    this.#commit(withoutCharacter(fit));
  }

  /** Who flies the fit is not an edit of it, so this does not go in the history. */
  setCharacter(character: Character) {
    this.#character = character;
    this.#publish(this.#calculate(this.#snapshot.fit));
  }

  undo() {
    this.goTo(this.#position - 1);
  }

  redo() {
    this.goTo(this.#position + 1);
  }

  goTo(position: number) {
    const fit = Number.isInteger(position) ? this.#history[position] : undefined;
    if (fit === undefined || position === this.#position) return;
    this.#position = position;
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

    this.#history.push(fit);
    if (this.#history.length > HISTORY_LIMIT) this.#history.shift();
    this.#position = this.#history.length - 1;
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
