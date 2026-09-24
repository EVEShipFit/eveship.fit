import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function readSdeFile(file: "sde.dat" | "names.dat"): Uint8Array {
  return readFileSync(require.resolve(`@eveshipfit/sde/dist/${file}`));
}
