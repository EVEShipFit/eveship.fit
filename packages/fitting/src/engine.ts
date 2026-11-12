import init, {
  calculate,
  load_esi_fitting,
  load_sde,
  save_esi_fitting,
  type InitInput,
} from "@eveshipfit/dogma-engine";
import type { CharacterFitting, Esi, FittingItem as EsiFittingItem, NewCharacterFitting } from "@eveshipfit/esi";
import type { Sde } from "@eveshipfit/sde-loader";

import { allSkills } from "./character.js";
import { emptyFit } from "./edits.js";
import { loadLink, saveLink } from "./link.js";
import { postLoad } from "./post-load.js";
import { chargesPerLoad } from "./price.js";
import type { MutationRoll } from "./rules/mutation.js";
import { Stats } from "./stats.js";
import { FitStore, type Calculator } from "./store.js";
import { loadText, saveText, type TextFormat } from "./text.js";
import type { Character, Fit } from "./types.js";

export interface EngineOptions {
  /** Where to load the WASM from; by default, next to the engine's JavaScript. */
  wasm?: InitInput | Promise<InitInput>;
  /** ESI, for killmail links and market prices. */
  esi?: Esi;
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
  return new Engine(sde, options.esi);
}

export class Engine implements Calculator {
  readonly sde: Sde;
  readonly esi: Esi | undefined;
  #defaultCharacter: Character | undefined;

  constructor(sde: Sde, esi?: Esi) {
    this.sde = sde;
    this.esi = esi;
  }

  /** Every published skill at level V; what a fit is flown by until told otherwise. */
  get defaultCharacter(): Character {
    this.#defaultCharacter ??= allSkills(this.sde, 5);
    return this.#defaultCharacter;
  }

  /** Without `fit`, an empty store until a fit is put in with `replace`. */
  createFit(fit?: Fit | { ship: number }, character: Character = this.defaultCharacter): FitStore {
    return new FitStore(this, fit === undefined || "items" in fit ? fit : emptyFit(fit.ship), character);
  }

  calculate(fit: Fit, character: Character = this.defaultCharacter): Stats {
    return new Stats(this.sde, fit, calculate({ ...fit, character }, { validate: true }));
  }

  /** The fit of an EVEShip.fit link, as the `fit` value of its query string. */
  loadLink(link: string, character: Character = this.defaultCharacter): Promise<Fit> {
    return loadLink(link, this.esi, character);
  }

  /** The `fit` value of an EVEShip.fit link to the fit. */
  saveLink(fit: Fit): string {
    return saveLink(fit);
  }

  /** The fit in EFT, DNA or esf/1 text, as copied from EVE, Pyfa or EVEShip.fit. */
  loadText(text: string, character: Character = this.defaultCharacter): Fit {
    return loadText(text, character);
  }

  saveText(fit: Fit, format: TextFormat): string {
    return saveText(fit, format);
  }

  /** How a mutated item in game was rolled, by its type ID and item ID. */
  async loadMutation(typeId: number, itemId: number): Promise<MutationRoll> {
    if (this.esi === undefined) throw new Error("Looking up a mutated item needs the engine to have `esi`");
    const item = await this.esi.dynamicItem(typeId, itemId);
    const plasmid = this.sde.mutaplasmid(item.mutator_type_id);
    if (plasmid === undefined) throw new Error(`Unknown mutaplasmid ${item.mutator_type_id}`);
    const attributes: Record<number, number> = {};
    for (const { attribute_id, value } of item.dogma_attributes) {
      if (plasmid.attributes.has(attribute_id)) attributes[attribute_id] = value;
    }
    return { base: item.source_type_id, mutaplasmid: plasmid.id, attributes };
  }

  /** The fit of a fitting a character saved in game. */
  loadEsiFitting(fitting: CharacterFitting, character: Character = this.defaultCharacter): Fit {
    return postLoad(load_esi_fitting(fitting), character);
  }

  /** The fit as a fitting a character can save in game: mutated items as their base, and a load of each charge in cargo. */
  saveEsiFitting(fit: Fit): NewCharacterFitting {
    const items = fit.items.map(({ mutation, ...item }) =>
      mutation === undefined ? item : { ...item, type_id: mutation.base },
    );
    const saved = save_esi_fitting({ ...fit, items });
    return { description: "", ...saved, items: [...saved.items, ...cargoCharges(this.sde, fit)] };
  }
}

/** One load per module of each loaded charge the cargo does not hold, as ESI fitting items. */
function cargoCharges(sde: Sde, fit: Fit): EsiFittingItem[] {
  const inCargo = new Set(fit.items.filter((item) => item.slot.type === "cargo").map((item) => item.type_id));
  const quantities = new Map<number, number>();
  for (const { type_id, charge } of fit.items) {
    if (charge === undefined || inCargo.has(charge.type_id)) continue;
    quantities.set(
      charge.type_id,
      (quantities.get(charge.type_id) ?? 0) + chargesPerLoad(sde, type_id, charge.type_id),
    );
  }
  return [...quantities]
    .filter(([, quantity]) => quantity > 0)
    .map(([type_id, quantity]) => ({ type_id, flag: "Cargo", quantity }));
}
