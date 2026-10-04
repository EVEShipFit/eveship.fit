import { load_eft, load_esf, save_eft, save_esf } from "@eveshipfit/dogma-engine";

import type { Fit } from "./types.js";

export type TextFormat = "eft" | "esf";

export function loadText(text: string): Fit {
  const trimmed = text.trim();
  return trimmed.startsWith("%esf/") ? load_esf(trimmed) : load_eft(trimmed);
}

export function saveText(fit: Fit, format: TextFormat): string {
  return format === "esf" ? save_esf(fit) : save_eft(fit);
}
