const baseUrl = "https://zkillboard.com/api";
const timeout = 10_000;
const spacing = 1_000;

/** A zKillboard client. */
export class ZKillboard {
  readonly #prices = new Map<number, Promise<number | undefined>>();
  #queue: Promise<unknown> = Promise.resolve();

  /** zKillboard's current price of a type in ISK; undefined when it has none. */
  price(typeId: number): Promise<number | undefined> {
    let price = this.#prices.get(typeId);
    if (price === undefined) {
      price = this.#queued(() => fetchPrice(typeId));
      this.#prices.set(typeId, price);
    }
    return price;
  }

  #queued<T>(request: () => Promise<T>): Promise<T> {
    const result = this.#queue.then(request);
    this.#queue = result.catch(() => {}).then(() => new Promise((resolve) => setTimeout(resolve, spacing)));
    return result;
  }
}

async function fetchPrice(typeId: number): Promise<number | undefined> {
  const response = await fetch(`${baseUrl}/prices/${typeId}/`, { signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`zKillboard /prices/${typeId}/: HTTP ${response.status}`);
  const { currentPrice } = (await response.json()) as { currentPrice?: number | string };
  const price = Number(currentPrice);
  return price > 0.01 ? price : undefined;
}
