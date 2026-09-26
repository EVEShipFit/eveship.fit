import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { loadSde } from "@eveshipfit/sde-loader";

import { createEngine, type Engine } from "../src/index.js";

const require = createRequire(import.meta.url);

export function readDependencyFile(path: string): Uint8Array {
  return readFileSync(require.resolve(path));
}

let loading: Promise<Engine> | undefined;

/** The real SDE and engine, loaded once per test file. */
export function testEngine(): Promise<Engine> {
  loading ??= loadSde({ bytes: readDependencyFile("@eveshipfit/sde/dist/sde.dat") }).then((sde) =>
    createEngine(sde, { wasm: readDependencyFile("@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm") }),
  );
  return loading;
}

/** Type ID by exact English name, so tests read like a fit. */
export function typeIdOf(engine: Engine, name: string): number {
  const type = engine.sde.typeByName(name);
  if (type === undefined) throw new Error(`No type named ${name}`);
  return type.id;
}
