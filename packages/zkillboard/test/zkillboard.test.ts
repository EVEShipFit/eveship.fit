import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { ZKillboard } from "../src/index.js";

let fetch: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal("fetch", fetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("a price is zKillboard's current price", async () => {
  fetch.mockResolvedValue(Response.json({ "2026-09-01": 144_800_000, currentPrice: "136063333.33", typeID: 41511 }));

  await expect(new ZKillboard().price(41511)).resolves.toBe(136_063_333.33);
  expect(fetch).toHaveBeenCalledWith("https://zkillboard.com/api/prices/41511/", expect.anything());
  expect(fetch.mock.calls[0]?.[1]).not.toHaveProperty("headers");
});

test("a price zKillboard does not know is undefined", async () => {
  fetch.mockResolvedValue(Response.json({ currentPrice: 0.01 }));

  await expect(new ZKillboard().price(123)).resolves.toBeUndefined();
});

test("a type is asked for once", async () => {
  fetch.mockImplementation(async () => Response.json({ currentPrice: 1_000 }));
  const zkillboard = new ZKillboard();

  await Promise.all([zkillboard.price(123), zkillboard.price(123)]);
  await zkillboard.price(123);

  expect(fetch).toHaveBeenCalledTimes(1);
});

test("requests go one at a time, a second apart", async () => {
  vi.useFakeTimers();
  fetch.mockImplementation(async () => Response.json({ currentPrice: 1_000 }));
  const zkillboard = new ZKillboard();

  const prices = [zkillboard.price(1), zkillboard.price(2), zkillboard.price(3)];
  await vi.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(999);
  expect(fetch).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  expect(fetch).toHaveBeenCalledTimes(2);

  await vi.advanceTimersByTimeAsync(1_000);
  await Promise.all(prices);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("a failed request rejects, and the next still waits its turn", async () => {
  vi.useFakeTimers();
  fetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
  fetch.mockImplementation(async () => Response.json({ currentPrice: 1_000 }));
  const zkillboard = new ZKillboard();

  const failed = zkillboard.price(1).catch((caught: unknown) => caught);
  const next = zkillboard.price(2);
  await vi.advanceTimersByTimeAsync(0);
  expect(await failed).toMatchObject({ message: "zKillboard /prices/1/: HTTP 500" });
  expect(fetch).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1_000);
  await expect(next).resolves.toBe(1_000);
});
