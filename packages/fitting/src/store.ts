import type { Sde } from "@eveshipfit/sde-loader";

import * as edits from "./edits.js";
import type { MutationRoll } from "./rules/mutation.js";
import { placementOf } from "./rules/placement.js";
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
  #snapshot: Snapshot | undefined;
  /** Oldest first; an edit goes at the end, also after going back. */
  readonly #history: Fit[];
  #position: number;
  readonly #listeners = new Set<() => void>();

  constructor(calculator: Calculator, fit: Fit | undefined, character: Character, damageProfile?: DamageProfile) {
    this.#calculator = calculator;
    this.#character = character;
    this.#damageProfile = damageProfile;
    this.#snapshot = fit && this.#calculate(edits.withMode(calculator.sde, withoutCharacter(fit)));
    this.#history = this.#snapshot ? [this.#snapshot.fit] : [];
    this.#position = this.#history.length - 1;
  }

  /** Throws while the store is empty. */
  getSnapshot = (): Snapshot => {
    if (this.#snapshot === undefined) throw new Error("The store has no fit yet; check `hasFit` first");
    return this.#snapshot;
  };

  get hasFit(): boolean {
    return this.#snapshot !== undefined;
  }

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

  /** 0 is the oldest; -1 while empty. */
  get historyPosition(): number {
    return this.#position;
  }

  /** Picks the rack and the first free slot, unless `slot` says where. */
  fit(typeId: number, slot?: Slot): ItemRef | undefined {
    if (this.#snapshot === undefined) return undefined;
    const { fit, ref } = edits.fitType(this.#calculator.sde, this.#snapshot.fit, this.#snapshot.stats, typeId, slot);
    this.#commit(fit);
    return ref;
  }

  /** Like `fit`, but mutated. */
  fitMutated(roll: MutationRoll, slot?: Slot): ItemRef | undefined {
    if (this.#snapshot === undefined) return undefined;
    const { sde } = this.#calculator;
    const type = sde.type(roll.base);
    if (type && placementOf(sde, type)?.type === "drone_bay") {
      const added = edits.addMutatedDrone(sde, this.#snapshot.fit, this.#snapshot.stats, roll);
      this.#commit(added.fit);
      return added.ref;
    }
    const { fit, ref } = edits.fitType(sde, this.#snapshot.fit, this.#snapshot.stats, roll.base, slot);
    if (ref === undefined) return undefined;
    const mutated = edits.setMutation(sde, fit, ref, roll);
    if (mutated === fit) return undefined;
    this.#commit(mutated);
    return ref;
  }

  /** To another slot of the same rack, swapping places with what is there. */
  move(ref: ItemRef, slot: Slot) {
    this.#edit((fit) => edits.move(fit, ref, slot));
  }

  /** To another slot of the same rack, replacing what is there. */
  copy(ref: ItemRef, slot: Slot) {
    this.#edit((fit) => edits.copy(fit, ref, slot));
  }

  /** Another type in the same slot, keeping the state, and the charge when it still fits. */
  setType(ref: ItemRef, typeId: number) {
    const { sde } = this.#calculator;
    this.#edit((fit, stats) => edits.setType(sde, fit, stats, ref, typeId));
  }

  setMutation(ref: ItemRef, roll: MutationRoll | undefined) {
    this.#edit((fit) => edits.setMutation(this.#calculator.sde, fit, ref, roll));
  }

  setDronesMutation(refs: readonly ItemRef[], roll: MutationRoll | undefined) {
    this.#edit((fit) => edits.setDronesMutation(this.#calculator.sde, fit, refs, roll));
  }

  setMutatedDrones(base: number, rolls: readonly MutationRoll[]) {
    this.#edit((fit) => edits.setMutatedDrones(this.#calculator.sde, fit, base, rolls));
  }

  setActiveMutatedDrones(base: number, count: number) {
    this.#edit((fit) => edits.setActiveMutatedDrones(this.#calculator.sde, fit, base, count));
  }

  setMutatedDroneQuantity(base: number, quantity: number) {
    const { sde } = this.#calculator;
    this.#edit((fit, stats) => edits.setMutatedDroneQuantity(sde, fit, stats, base, quantity));
  }

  remove(...refs: ItemRef[]) {
    this.#edit((fit) => edits.remove(fit, ...refs));
  }

  setState(ref: ItemRef, state: State) {
    this.#edit((fit) => edits.setState(fit, ref, state));
  }

  setCharge(ref: ItemRef, chargeTypeId: number | undefined) {
    this.#edit((fit) => edits.setCharge(fit, ref, chargeTypeId));
  }

  setQuantity(ref: ItemRef, quantity: number) {
    this.#edit((fit) => edits.setQuantity(fit, ref, quantity));
  }

  setActiveDrones(typeId: number, count: number) {
    this.#edit((fit) => edits.setActiveDrones(fit, typeId, count));
  }

  setDroneQuantity(typeId: number, quantity: number) {
    const { sde } = this.#calculator;
    this.#edit((fit, stats) => edits.setDroneQuantity(sde, fit, stats, typeId, quantity));
  }

  setCargoQuantity(typeId: number, quantity: number) {
    this.#edit((fit) => edits.setCargoQuantity(fit, typeId, quantity));
  }

  setFighterBayQuantity(typeId: number, quantity: number) {
    this.#edit((fit) => edits.setFighterBayQuantity(fit, typeId, quantity));
  }

  setSquadronSize(ref: ItemRef, size: number) {
    this.#edit((fit) => edits.setSquadronSize(this.#calculator.sde, fit, ref, size));
  }

  setName(name: string) {
    this.#edit((fit) => edits.setName(fit, name));
  }

  /** Only to a mode of the ship. */
  setMode(modeTypeId: number) {
    this.#edit((fit) => edits.setMode(this.#calculator.sde, fit, modeTypeId));
  }

  /** Swap in another fit entirely, like an import. */
  replace(fit: Fit) {
    const replacement = edits.withMode(this.#calculator.sde, withoutCharacter(fit));
    if (this.#snapshot !== undefined && equal(replacement, this.#snapshot.fit)) return;
    this.#commit(replacement);
  }

  /** Who flies the fit is not an edit of it, so this does not go in the history. */
  setCharacter(character: Character) {
    this.#character = character;
    this.#recalculate();
  }

  /** Like the character, not an edit of the fit. */
  setDamageProfile(damageProfile: DamageProfile | undefined) {
    this.#damageProfile = damageProfile;
    this.#recalculate();
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
    if (this.#snapshot === undefined || this.#history.length === 1) return;
    this.#history.splice(0, this.#history.length, this.#snapshot.fit);
    this.#position = 0;
    // The history follows the snapshot.
    this.#publish(Object.freeze({ ...this.#snapshot }));
  }

  /** What `edit` would do, without doing it; throws while the store is empty. */
  preview(edit: (fit: FitStore) => void): Preview {
    const before = this.getSnapshot();
    const draft = new FitStore(this.#calculator, before.fit, this.#character, this.#damageProfile);
    draft.#history.splice(0, 1, ...this.#history);
    draft.#position = this.#position;
    edit(draft);
    return { before, after: draft.getSnapshot() };
  }

  #edit(change: (fit: Fit, stats: Stats) => Fit) {
    if (this.#snapshot !== undefined) this.#commit(change(this.#snapshot.fit, this.#snapshot.stats));
  }

  #commit(fit: Fit) {
    if (fit === this.#snapshot?.fit) return;

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

  #recalculate() {
    if (this.#snapshot === undefined) this.#notify();
    else this.#publish(this.#calculate(this.#snapshot.fit));
  }

  #publish(snapshot: Snapshot) {
    this.#snapshot = snapshot;
    this.#notify();
  }

  #notify() {
    for (const listener of this.#listeners) listener();
  }
}

function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (a instanceof Map || b instanceof Map) return equal(entries(a), entries(b));
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a).filter((key) => (a as Record<string, unknown>)[key] !== undefined);
  const other = Object.keys(b).filter((key) => (b as Record<string, unknown>)[key] !== undefined);
  return (
    keys.length === other.length &&
    keys.every((key) => equal((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
  );
}

function entries(value: object): Record<string, unknown> {
  return value instanceof Map ? Object.fromEntries(value) : (value as Record<string, unknown>);
}

function withoutCharacter({ character: _, ...fit }: Fit): Fit {
  return fit;
}
