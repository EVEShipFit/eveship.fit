import init, { calculate, load_sde, type InitInput } from "@eveshipfit/dogma-engine";
import type { Sde } from "@eveshipfit/sde-loader";

import { allSkills } from "./character.js";
import { emptyFit } from "./edits.js";
import { Stats } from "./stats.js";
import { FitStore, type Calculator } from "./store.js";
import type { Character, Fit } from "./types.js";

export interface EngineOptions {
  /** Where to load the WASM from; by default, next to the engine's JavaScript. */
  wasm?: InitInput;
}

// The WASM module holds the SDE for the rest of the page's life; `load_sde` refuses a second one.
let loaded: { sde: Sde; ready: Promise<void> } | undefined;

export async function createEngine(sde: Sde, options: EngineOptions = {}): Promise<Engine> {
  if (loaded === undefined) {
    loaded = { sde, ready: init({ module_or_path: options.wasm }).then(() => void load_sde(sde.bytes)) };
  } else if (loaded.sde !== sde) {
    throw new Error("The engine already holds another SDE; there can only be one per page");
  }

  const { ready } = loaded;
  try {
    await ready;
  } catch (error) {
    // Nothing is held after a failure, so a later call may try again.
    if (loaded?.ready === ready) loaded = undefined;
    throw error;
  }
  return new Engine(sde);
}

export class Engine implements Calculator {
  readonly sde: Sde;
  #defaultCharacter: Character | undefined;

  constructor(sde: Sde) {
    this.sde = sde;
  }

  /** Every published skill at level V; what a fit is flown by until told otherwise. */
  get defaultCharacter(): Character {
    this.#defaultCharacter ??= allSkills(this.sde, 5);
    return this.#defaultCharacter;
  }

  createFit(fit: Fit | { ship: number }, character: Character = this.defaultCharacter): FitStore {
    return new FitStore(this, "items" in fit ? fit : emptyFit(fit.ship), character);
  }

  calculate(fit: Fit, character: Character = this.defaultCharacter): Stats {
    return new Stats(this.sde, fit, calculate({ ...fit, character }, { validate: true }));
  }
}
