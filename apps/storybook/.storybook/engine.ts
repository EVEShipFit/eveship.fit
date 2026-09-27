import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { createEngine, type Engine } from "@eveshipfit/fitting";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import { loadSde } from "@eveshipfit/sde-loader";

let engine: Promise<Engine> | undefined;

/** The real SDE and engine, loaded once for every story. */
export function loadEngine(): Promise<Engine> {
  engine ??= loadSde({ url: sdeUrl }).then((sde) => createEngine(sde, { wasm: wasmUrl }));
  return engine;
}
