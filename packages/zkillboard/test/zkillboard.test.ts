import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { ZKillboard } from "../src/index.js";

let fetch: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  vi.useFakeTimers({ now: Date.UTC(2026, 10, 23, 12) });
  fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal("fetch", fetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("the prices are yesterday's, by type ID", async () => {
  fetch.mockResolvedValue(Response.json({ "587": 600_000, "671": "128364874378.22" }));

  const prices = await new ZKillboard().prices();

  expect([...prices]).toEqual([
    [587, 600_000],
    [671, 128_364_874_378.22],
  ]);
  expect(fetch).toHaveBeenCalledWith("https://zkillboard.com/api/prices/date/2026-11-22/", expect.anything());
  expect(fetch.mock.calls[0]?.[1]).not.toHaveProperty("headers");
});

test("a price zKillboard does not know is left out", async () => {
  fetch.mockResolvedValue(Response.json({ "587": 600_000, "123": 0.01 }));

  const prices = await new ZKillboard().prices();

  expect(prices.has(123)).toBe(false);
});

test("the prices are fetched once a day", async () => {
  fetch.mockImplementation(async () => Response.json({ "587": 600_000 }));
  const zkillboard = new ZKillboard();

  const [first, second] = await Promise.all([zkillboard.prices(), zkillboard.prices()]);
  expect(second).toBe(first);
  expect(fetch).toHaveBeenCalledTimes(1);

  vi.setSystemTime(Date.UTC(2026, 10, 24));
  await zkillboard.prices();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenLastCalledWith("https://zkillboard.com/api/prices/date/2026-11-23/", expect.anything());
});

test("a failed fetch rejects, and is tried again", async () => {
  fetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
  fetch.mockImplementation(async () => Response.json({ "587": 600_000 }));
  const zkillboard = new ZKillboard();

  await expect(zkillboard.prices()).rejects.toThrow("zKillboard /prices/date/2026-11-22/: HTTP 500");
  expect((await zkillboard.prices()).get(587)).toBe(600_000);
  expect(fetch).toHaveBeenCalledTimes(2);
});
