import { load_dna, load_esf_link, load_killmail, load_link, save_esf_link } from "@eveshipfit/dogma-engine";
import type { Esi, Killmail } from "@eveshipfit/esi";

import { postLoad } from "./post-load.js";
import type { Character, Fit } from "./types.js";

export async function loadLink(link: string, esi: Esi | undefined, character: Character): Promise<Fit> {
  const separator = link.indexOf(":");
  if (separator === -1) throw new Error("A fit link is <version>:<payload>");
  const version = link.slice(0, separator);
  const payload = link.slice(separator + 1);

  if (version === "esf1") return load_esf_link(payload);
  if (version === "dna") return postLoad(load_dna(payload), character);
  if (version === "killmail") return load_killmail(await fetchKillmail(payload, esi));
  const fit = load_link(version, await gunzip(payload));
  return version === "eft" ? postLoad(fit, character) : fit;
}

export function saveLink(fit: Fit): string {
  return `esf1:${save_esf_link(fit)}`;
}

async function fetchKillmail(idAndHash: string, esi: Esi | undefined): Promise<Killmail> {
  const match = /^(\d+)\/([0-9a-f]+)$/.exec(idAndHash);
  if (match === null) throw new Error("A killmail link is killmail:<id>/<hash>");
  if (esi === undefined) throw new Error("A killmail link needs the engine to have `esi`");
  return esi.killmail(Number(match[1]), match[2]!);
}

async function gunzip(base64: string): Promise<string> {
  // A `+` in a query string reads back as a space.
  const bytes = Uint8Array.from(atob(base64.replaceAll(" ", "+")), (char) => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}
