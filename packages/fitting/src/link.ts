import { load_killmail, load_link, type EsiKillmail } from "@eveshipfit/dogma-engine";

import type { Fit } from "./types.js";

export async function loadLink(link: string): Promise<Fit> {
  const separator = link.indexOf(":");
  if (separator === -1) throw new Error("A fit link is <version>:<payload>");
  const version = link.slice(0, separator);
  const payload = link.slice(separator + 1);

  if (version === "killmail") return load_killmail(await fetchKillmail(payload));
  return load_link(version, await gunzip(payload));
}

async function fetchKillmail(idAndHash: string): Promise<EsiKillmail> {
  const [id, hash] = idAndHash.split("/", 2);
  const response = await fetch(`https://esi.evetech.net/killmails/${id}/${hash}`, {
    headers: { "X-Compatibility-Date": "2025-08-26" },
  });
  if (!response.ok) throw new Error(`Killmail ${id} could not be fetched: HTTP ${response.status}`);
  return (await response.json()) as EsiKillmail;
}

async function gunzip(base64: string): Promise<string> {
  // A `+` in a query string reads back as a space.
  const bytes = Uint8Array.from(atob(base64.replaceAll(" ", "+")), (char) => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}
