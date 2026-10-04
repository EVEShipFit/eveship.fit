import { gzipSync } from "node:zlib";

import { Esi } from "@eveshipfit/esi";
import { expect, test, vi } from "vitest";

import { createEngine } from "../src/index.js";
import { testEngine, typeIdOf } from "./engine.js";

function link(version: string, payload: string): string {
  return `${version}:${gzipSync(payload).toString("base64")}`;
}

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

test("a dna link", async () => {
  const engine = await testEngine();
  const cannon = typeIdOf(engine, "200mm AutoCannon I");

  const fit = await engine.loadLink(`dna:587:${cannon};2::`);

  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(expect.objectContaining({ type_id: cannon, slot: { type: "high", index: 1 } }));
});

test("an esf1 link reads back as the fit it was saved from", async () => {
  const engine = await testEngine();
  const cannon = typeIdOf(engine, "200mm AutoCannon I");
  const fit = await engine.loadLink(link("v3", `ship,587,My Rifter,\nmodule,High,1,${cannon},Active,\n`));

  const saved = engine.saveLink(fit);

  expect(saved).toMatch(/^esf1:[\w-]+$/);
  const loaded = await engine.loadLink(saved);
  expect(loaded.name).toBe("My Rifter");
  expect(loaded.items).toContainEqual(
    expect.objectContaining({ type_id: cannon, slot: { type: "high", index: 0 }, state: "active" }),
  );
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
  const base = await testEngine();
  const cannon = typeIdOf(base, "200mm AutoCannon I");
  const esi = new Esi({ userAgent: "test" });
  const killmail = vi.spyOn(esi, "killmail").mockResolvedValue({
    killmail_id: 123,
    killmail_time: "2026-09-30T12:00:00Z",
    solar_system_id: 30000142,
    victim: {
      ship_type_id: 587,
      damage_taken: 1000,
      items: [{ flag: 27, item_type_id: cannon, singleton: 0, quantity_destroyed: 1 }],
    },
    attackers: [],
  });
  const engine = await createEngine(base.sde, { esi });

  const fit = await engine.loadLink("killmail:123/abc");

  expect(killmail).toHaveBeenCalledWith(123, "abc");
  expect(fit.ship.type_id).toBe(587);
  expect(fit.items).toContainEqual(expect.objectContaining({ type_id: cannon }));
});

test("a killmail link without ESI", async () => {
  const engine = await testEngine();

  await expect(engine.loadLink("killmail:123/abc")).rejects.toThrow("needs the engine to have `esi`");
});

test("a killmail link without a hash", async () => {
  const esi = new Esi({ userAgent: "test" });
  const killmail = vi.spyOn(esi, "killmail");
  const engine = await createEngine((await testEngine()).sde, { esi });

  await expect(engine.loadLink("killmail:123")).rejects.toThrow("killmail:<id>/<hash>");
  expect(killmail).not.toHaveBeenCalled();
});

test("an unknown version", async () => {
  const engine = await testEngine();

  await expect(engine.loadLink(link("v4", "587"))).rejects.toThrow("unknown link version");
});

test("a link without a version", async () => {
  const engine = await testEngine();

  await expect(engine.loadLink("587")).rejects.toThrow("<version>:<payload>");
});
