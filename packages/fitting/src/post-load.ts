import { post_load } from "@eveshipfit/dogma-engine";

import type { Character, Fit } from "./types.js";

/** The fit with the states EVE gives an imported EFT or ESI fit. */
export function postLoad(fit: Fit, character: Character): Fit {
  const { character: _, ...settled } = post_load({ ...fit, character });
  return settled;
}
