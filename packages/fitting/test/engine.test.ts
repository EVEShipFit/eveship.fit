import { Sde } from "@eveshipfit/sde-loader";
import { expect, test } from "vitest";

import { createEngine } from "../src/index.js";
import { readDependencyFile, testEngine } from "./engine.js";

test("a failed load can be tried again", async () => {
  const sde = new Sde(readDependencyFile("@eveshipfit/sde/dist/sde.dat"));
  await expect(createEngine(sde, { wasm: new Uint8Array() })).rejects.toThrow(WebAssembly.CompileError);
  await expect(testEngine()).resolves.toBeDefined();
});

test("the SDE of the engine is the one it was created with", async () => {
  const engine = await testEngine();
  const again = await createEngine(engine.sde);
  expect(again.sde).toBe(engine.sde);
});

test("a second SDE is refused", async () => {
  await testEngine();
  const other = new Sde(readDependencyFile("@eveshipfit/sde/dist/sde.dat"));
  await expect(createEngine(other)).rejects.toThrow("already holds another SDE");
});

test("calculate without a store", async () => {
  const engine = await testEngine();
  const stats = engine.calculate({ ship: { type_id: 587 }, items: [] });
  expect(stats.ship.get("cpuOutput")).toBeGreaterThan(0);
});
