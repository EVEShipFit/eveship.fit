const baseUrl = "https://zkillboard.com/api";
const timeout = 15_000;
const day = 86_400_000;

/** A zKillboard client. */
export class ZKillboard {
  #prices: { date: string; value: Promise<ReadonlyMap<number, number>> } | undefined;

  /**
   * zKillboard's price of every type it knows, in ISK, by type ID.
   *
   * The prices are those of yesterday (UTC), as today's are still filling in. They are fetched once, and again when
   * the day changes. A failed fetch rejects, and the next call tries again.
   */
  prices(): Promise<ReadonlyMap<number, number>> {
    const date = new Date(Date.now() - day).toISOString().slice(0, 10);
    if (this.#prices?.date === date) return this.#prices.value;

    const cached = { date, value: fetchPrices(date) };
    cached.value.catch(() => {
      if (this.#prices === cached) this.#prices = undefined;
    });
    this.#prices = cached;
    return cached.value;
  }
}

async function fetchPrices(date: string): Promise<ReadonlyMap<number, number>> {
  const path = `/prices/date/${date}/`;
  const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`zKillboard ${path}: HTTP ${response.status}`);
  const prices = (await response.json()) as Record<string, number | string>;

  const known = new Map<number, number>();
  for (const [typeId, value] of Object.entries(prices)) {
    const price = Number(value);
    if (price > 0.01) known.set(Number(typeId), price);
  }
  return known;
}
