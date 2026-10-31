import type { Sde } from "@eveshipfit/sde-loader";

import * as edits from "./edits.js";
import type { Stats } from "./stats.js";
import type { Character, DamageProfile, Fit, ItemRef, Slot, State } from "./types.js";

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
 * A fit that recalculates itself on every change, always in a mode when its ship
 * has modes. `subscribe` and `getSnapshot` are bound, so they can go straight
 * into `useSyncExternalStore`.
 */
export class FitStore {
  readonly #calculator: Calculator;
  #character: Character;
  #damageProfile: DamageProfile | undefined;
  #snapshot: Snapshot;
  /** Oldest first; an edit goes at the end, also after going back. */
  readonly #history: Fit[];
  #position: number;
  readonly #listeners = new Set<() => void>();

  constructor(calculator: Calculator, fit: Fit, character: Character, damageProfile?: DamageProfile) {
    this.#calculator = calculator;
    this.#character = character;
    this.#damageProfile = damageProfile;
    this.#snapshot = this.#calculate(edits.withMode(calculator.sde, withoutCharacter(fit)));
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

  /** Undefined is uniform. */
  get damageProfile(): DamageProfile | undefined {
    return this.#damageProfile;
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

  /** To another slot of the same rack, replacing what is there. */
  copy(ref: ItemRef, slot: Slot) {
    this.#commit(edits.copy(this.#snapshot.fit, ref, slot));
  }

  /** Another type in the same slot, keeping the state, and the charge when it still fits. */
  setType(ref: ItemRef, typeId: number) {
    const { sde } = this.#calculator;
    this.#commit(edits.setType(sde, this.#snapshot.fit, this.#snapshot.stats, ref, typeId));
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

  setFighterBayQuantity(typeId: number, quantity: number) {
    this.#commit(edits.setFighterBayQuantity(this.#snapshot.fit, typeId, quantity));
  }

  setSquadronSize(ref: ItemRef, size: number) {
    this.#commit(edits.setSquadronSize(this.#calculator.sde, this.#snapshot.fit, ref, size));
  }

  setName(name: string) {
    this.#commit(edits.setName(this.#snapshot.fit, name));
  }

  /** Only to a mode of the ship. */
  setMode(modeTypeId: number) {
    this.#commit(edits.setMode(this.#calculator.sde, this.#snapshot.fit, modeTypeId));
  }

  /** Swap in another fit entirely, like an import. */
  replace(fit: Fit) {
    const replacement = edits.withMode(this.#calculator.sde, withoutCharacter(fit));
    if (equal(replacement, this.#snapshot.fit)) return;
    this.#commit(replacement);
  }

  /** Who flies the fit is not an edit of it, so this does not go in the history. */
  setCharacter(character: Character) {
    this.#character = character;
    this.#publish(this.#calculate(this.#snapshot.fit));
  }

  /** Like the character, not an edit of the fit. */
  setDamageProfile(damageProfile: DamageProfile | undefined) {
    this.#damageProfile = damageProfile;
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

  /** Keeps only the current fit in the history. */
  clearHistory() {
    if (this.#history.length === 1) return;
    this.#history.splice(0, this.#history.length, this.#snapshot.fit);
    this.#position = 0;
    // The history follows the snapshot.
    this.#publish(Object.freeze({ ...this.#snapshot }));
  }

  /** What `edit` would do, without doing it. */
  preview(edit: (fit: FitStore) => void): Preview {
    const draft = new FitStore(this.#calculator, this.#snapshot.fit, this.#character, this.#damageProfile);
    draft.#history.splice(0, 1, ...this.#history);
    draft.#position = this.#position;
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
    const environment = this.#damageProfile && { ...fit.environment, damage_profile: this.#damageProfile };
    const calculated = environment ? { ...fit, environment } : fit;
    return Object.freeze({ fit, stats: this.#calculator.calculate(calculated, this.#character) });
  }

  #publish(snapshot: Snapshot) {
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) listener();
  }
}

function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a).filter((key) => (a as Record<string, unknown>)[key] !== undefined);
  const other = Object.keys(b).filter((key) => (b as Record<string, unknown>)[key] !== undefined);
  return (
    keys.length === other.length &&
    keys.every((key) => equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  );
}

function withoutCharacter({ character: _, ...fit }: Fit): Fit {
  return fit;
}
