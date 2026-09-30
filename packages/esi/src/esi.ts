import type { Killmail, MarketPrice } from "./types.js";

const baseUrl = "https://esi.evetech.net";
const compatibilityDate = "2026-08-18";
const timeout = 10_000;
const retries = 2;

export interface EsiOptions {
  /** Who is asking, as `AppName/version (email; +url)`. */
  userAgent: string;
}

/** ESI answered with an error. */
export class EsiError extends Error {
  readonly status: number;

  constructor(path: string, status: number, reason: string | undefined) {
    super(`ESI ${path}: ${reason ?? "request failed"} (HTTP ${status})`);
    this.name = "EsiError";
    this.status = status;
  }
}

interface Cached<T> {
  expires: number;
  value: Promise<T>;
}

export class Esi {
  readonly #userAgent: string;
  #pausedUntil = 0;
  #prices: Cached<ReadonlyMap<number, MarketPrice>> | undefined;

  constructor(options: EsiOptions) {
    this.#userAgent = options.userAgent;
  }

  /** A killmail, by its ID and hash. */
  async killmail(id: number, hash: string): Promise<Killmail> {
    const response = await this.#get(`/killmails/${id}/${encodeURIComponent(hash)}`);
    return (await response.json()) as Killmail;
  }

  /** The price of every type on the market, by type ID. */
  marketPrices(): Promise<ReadonlyMap<number, MarketPrice>> {
    if (this.#prices !== undefined && Date.now() < this.#prices.expires) return this.#prices.value;

    const cached: Cached<ReadonlyMap<number, MarketPrice>> = {
      expires: Infinity,
      value: this.#get("/markets/prices").then(async (response) => {
        cached.expires = Date.parse(response.headers.get("Expires") ?? "");
        const prices = (await response.json()) as MarketPrice[];
        return new Map(prices.map((price) => [price.type_id, price]));
      }),
    };
    cached.value.catch(() => {
      cached.expires = 0;
    });
    this.#prices = cached;
    return cached.value;
  }

  async #get(path: string): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      for (let paused; (paused = this.#pausedUntil - Date.now()) > 0;) {
        await new Promise((resolve) => setTimeout(resolve, paused));
      }

      const response = await fetch(`${baseUrl}${path}`, {
        headers: { "User-Agent": this.#userAgent, "X-Compatibility-Date": compatibilityDate },
        signal: AbortSignal.timeout(timeout),
      });
      if (response.ok) return response;

      const wait = waitFor(response);
      if (wait !== undefined) {
        this.#pausedUntil = Math.max(this.#pausedUntil, Date.now() + wait * 1000);
        if (attempt < retries) {
          await response.body?.cancel();
          continue;
        }
      }
      throw new EsiError(path, response.status, await reasonOf(response));
    }
  }
}

/** Seconds ESI wants every request to wait, after a 420 (too many errors) or 429 (too many requests). */
function waitFor(response: Response): number | undefined {
  let header;
  if (response.status === 420) header = "X-Esi-Error-Limit-Reset";
  else if (response.status === 429) header = "Retry-After";
  else return undefined;

  const seconds = Number(response.headers.get(header));
  return seconds > 0 ? seconds : 60;
}

async function reasonOf(response: Response): Promise<string | undefined> {
  const body = (await response.json().catch(() => undefined)) as { error?: unknown } | undefined;
  return typeof body?.error === "string" ? body.error : undefined;
}
