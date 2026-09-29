import { gzipSync } from "node:zlib";

import { afterEach, expect, test, vi } from "vitest";

import { testEngine, typeIdOf } from "./engine.js";

function link(version: string, payload: string): string {
  return `${version}:${gzipSync(payload).toString("base64")}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a v2 link", async () => {
  const engine = await testEngine();
  const cannon = typeIdOf(engine, "200mm AutoCannon I");
  const ammo = typeIdOf(engine, "EMP S");

  const fit = await engine.loadLink(link("v2", `587,My Rifter,\n27,${cannon},1,${ammo},Active\n`));

  expect(fit.name).toBe("My Rifter");
  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(
    expect.objectContaining({ type_id: cannon, slot: { type: "high", index: 0 }, charge: { type_id: ammo } }),
  );
});

test("a v3 link", async () => {
  const engine = await testEngine();
  const cannon = typeIdOf(engine, "200mm AutoCannon I");

  const fit = await engine.loadLink(link("v3", `ship,587,My Rifter,\nmodule,High,2,${cannon},Online,\n`));

  expect(fit.items).toContainEqual(
    expect.objectContaining({ type_id: cannon, slot: { type: "high", index: 1 }, state: "online" }),
  );
});

test("an eft link", async () => {
  const engine = await testEngine();

  const fit = await engine.loadLink(link("eft", "[Rifter, My Rifter]\n200mm AutoCannon I"));

  expect(fit.name).toBe("My Rifter");
  expect(fit.items).toContainEqual(expect.objectContaining({ type_id: typeIdOf(engine, "200mm AutoCannon I") }));
});

test("a + read back from a query string as a space", async () => {
  const engine = await testEngine();
  const payload = [...Array(64).keys()].map((index) => `27,${index},1`).join("\n");
  const encoded = link("v1", `587,My Rifter,\n${payload}`);
  expect(encoded).toContain("+");

  const fit = await engine.loadLink(new URLSearchParams(`fit=${encoded}`).get("fit")!);

  expect(fit.ship.type_id).toBe(587);
});

test("a killmail link fetches the killmail from ESI", async () => {
  const engine = await testEngine();
  const cannon = typeIdOf(engine, "200mm AutoCannon I");
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({
      killmail_id: 123,
      victim: { ship_type_id: 587, items: [{ flag: 27, item_type_id: cannon, quantity_destroyed: 1 }] },
    }),
  );
  vi.stubGlobal("fetch", fetch);

  const fit = await engine.loadLink("killmail:123/abc");

  expect(fetch).toHaveBeenCalledWith(
    "https://esi.evetech.net/killmails/123/abc",
    expect.objectContaining({ headers: { "X-Compatibility-Date": "2025-08-26" } }),
  );
  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(expect.objectContaining({ type_id: cannon }));
});

test("a killmail ESI does not know", async () => {
  const engine = await testEngine();
  vi.stubGlobal("fetch", async () => new Response(null, { status: 422 }));

  await expect(engine.loadLink("killmail:123/abc")).rejects.toThrow("HTTP 422");
});

test("a killmail link without a hash", async () => {
  const engine = await testEngine();
  const fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal("fetch", fetch);

  await expect(engine.loadLink("killmail:123")).rejects.toThrow("killmail:<id>/<hash>");
  expect(fetch).not.toHaveBeenCalled();
});

test("an unknown version", async () => {
  const engine = await testEngine();

  await expect(engine.loadLink(link("v4", "587"))).rejects.toThrow("unknown link version");
});

test("a link without a version", async () => {
  const engine = await testEngine();

  await expect(engine.loadLink("587")).rejects.toThrow("<version>:<payload>");
});
