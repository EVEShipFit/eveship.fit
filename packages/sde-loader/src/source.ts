export type Source = { url: string | URL } | { bytes: Uint8Array };

export async function readSource(source: Source): Promise<Uint8Array> {
  if ("bytes" in source) return source.bytes;

  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Fetching ${source.url.toString()} failed: ${response.status} ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
