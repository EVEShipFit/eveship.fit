import { load_dna, load_eft, load_esf, save_eft, save_esf } from "@eveshipfit/dogma-engine";

import { postLoad } from "./post-load.js";
import type { Character, Fit } from "./types.js";

export type TextFormat = "eft" | "esf";

export function loadText(text: string, character: Character): Fit {
  const trimmed = text.trim();
  if (trimmed.startsWith("%esf/")) return load_esf(trimmed);
  if (/^(fitting:)?\d+:/.test(trimmed)) return postLoad(load_dna(trimmed), character);
  return postLoad(load_eft(trimmed), character);
}

export function saveText(fit: Fit, format: TextFormat): string {
  return format === "esf" ? save_esf(fit) : save_eft(fit);
}
