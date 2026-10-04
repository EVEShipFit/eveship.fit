import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { Esi, EsiError } from "../src/index.js";

const esi = () => new Esi({ userAgent: "test/1.0 (test@example.com)" });

let fetch: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal("fetch", fetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("a request goes to the unversioned route, with a compatibility date and user agent", async () => {
  fetch.mockResolvedValue(Response.json({ killmail_id: 123 }));

  await esi().killmail(123, "abc");

  expect(fetch).toHaveBeenCalledWith(
    "https://esi.evetech.net/killmails/123/abc",
    expect.objectContaining({
      headers: {
        "User-Agent": "test/1.0 (test@example.com)",
        "X-User-Agent": "test/1.0 (test@example.com)",
        "X-Compatibility-Date": "2026-08-18",
      },
    }),
  );
});

test("an error carries ESI's reason and status", async () => {
  fetch.mockResolvedValue(Response.json({ error: "Invalid killmail_id and/or killmail_hash" }, { status: 422 }));

  const error = await esi()
    .killmail(123, "abc")
    .catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(EsiError);
  expect(error).toMatchObject({
    status: 422,
    message: "ESI /killmails/123/abc: Invalid killmail_id and/or killmail_hash (HTTP 422)",
  });
});

test("market prices by type ID", async () => {
  fetch.mockResolvedValue(Response.json([{ type_id: 587, average_price: 250_000, adjusted_price: 240_000 }]));

  const prices = await esi().marketPrices();

  expect(fetch).toHaveBeenCalledWith("https://esi.evetech.net/markets/prices", expect.anything());
  expect(prices.get(587)).toEqual({ type_id: 587, average_price: 250_000, adjusted_price: 240_000 });
});

test("market prices are fetched once until they expire", async () => {
  vi.useFakeTimers({ now: new Date("2026-09-30T18:00:00Z") });
  const expires = { headers: { Expires: "Wed, 30 Sep 2026 19:00:00 GMT" } };
  fetch.mockImplementation(async () => Response.json([{ type_id: 587 }], expires));
  const client = esi();

  const [first, second] = await Promise.all([client.marketPrices(), client.marketPrices()]);
  expect(second).toBe(first);
  expect(await client.marketPrices()).toBe(first);
  expect(fetch).toHaveBeenCalledTimes(1);

  vi.setSystemTime(new Date("2026-09-30T19:00:00Z"));
  expect(await client.marketPrices()).not.toBe(first);
  expect(fetch).toHaveBeenCalledTimes(2);
});

test("market prices that failed are fetched again", async () => {
  fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
  fetch.mockResolvedValueOnce(Response.json([{ type_id: 587 }]));
  const client = esi();

  await expect(client.marketPrices()).rejects.toThrow("HTTP 503");
  expect((await client.marketPrices()).has(587)).toBe(true);
});

test.each([
  [420, { "X-Esi-Error-Limit-Reset": "30", "Retry-After": "5" }, 30_000],
  [429, { "X-Esi-Error-Limit-Reset": "30", "Retry-After": "5" }, 5_000],
  [429, {}, 60_000],
])("a %i waits as long as ESI asks before every next request", async (status, headers, wait) => {
  vi.useFakeTimers();
  fetch.mockResolvedValueOnce(new Response(null, { status, headers }));
  fetch.mockImplementation(async () => Response.json({ killmail_id: 123 }));
  const client = esi();

  const first = client.killmail(123, "abc");
  await vi.advanceTimersByTimeAsync(0);
  const second = client.killmail(456, "def");
  await vi.advanceTimersByTimeAsync(wait - 1);
  expect(fetch).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  await expect(first).resolves.toEqual({ killmail_id: 123 });
  await second;
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("a request that keeps being limited gives up", async () => {
  vi.useFakeTimers();
  fetch.mockImplementation(async () => new Response(null, { status: 429, headers: { "Retry-After": "1" } }));

  const error = esi()
    .killmail(123, "abc")
    .catch((caught: unknown) => caught);
  await vi.advanceTimersByTimeAsync(2_000);

  expect(await error).toMatchObject({ status: 429 });
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("a request that is waiting keeps waiting when the wait grows", async () => {
  vi.useFakeTimers();
  fetch.mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "5" } }));
  fetch.mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "10" } }));
  fetch.mockImplementation(async () => Response.json({ killmail_id: 123 }));
  const client = esi();

  const first = client.killmail(123, "abc");
  const second = client.killmail(456, "def");
  await vi.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(9_999);
  expect(fetch).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(1);
  await Promise.all([first, second]);
  expect(fetch).toHaveBeenCalledTimes(4);
});

test("a request that gave up still makes the next one wait", async () => {
  vi.useFakeTimers();
  fetch.mockResolvedValue(new Response(null, { status: 429, headers: { "Retry-After": "1" } }));
  const client = esi();
  const error = client.killmail(123, "abc").catch((caught: unknown) => caught);
  await vi.advanceTimersByTimeAsync(2_000);
  await error;

  fetch.mockResolvedValue(Response.json({ killmail_id: 456 }));
  const next = client.killmail(456, "def");
  await vi.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledTimes(3);

  await vi.advanceTimersByTimeAsync(1_000);
  await expect(next).resolves.toEqual({ killmail_id: 456 });
});

test("a character's skills, skill queue and fittings go with its access token", async () => {
  fetch.mockImplementation(async () => Response.json([]));
  const client = esi();

  await client.characterSkills(90000001, "token");
  await client.characterSkillQueue(90000001, "token");
  await client.characterFittings(90000001, "token");

  expect(fetch).toHaveBeenCalledWith(
    "https://esi.evetech.net/characters/90000001/skills",
    expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token" }) }),
  );
  expect(fetch).toHaveBeenCalledWith("https://esi.evetech.net/characters/90000001/skillqueue", expect.anything());
  expect(fetch).toHaveBeenCalledWith("https://esi.evetech.net/characters/90000001/fittings", expect.anything());
});
