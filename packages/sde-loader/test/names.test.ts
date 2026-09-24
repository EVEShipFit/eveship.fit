import { beforeAll, expect, test } from "vitest";

import { loadNames, type Names } from "../src/index.js";
import { readSdeFile } from "./files.js";

let names: Names;
beforeAll(async () => {
  names = await loadNames({ bytes: readSdeFile("names.dat") });
});

test("rejects a file that is not a names file", async () => {
  await expect(loadNames({ bytes: new Uint8Array(64) })).rejects.toThrow("Not a names file");
});

test("finds a type in any language, any case", () => {
  expect(names.typeId("Rifter")).toBe(587);
  expect(names.typeId("RIFTER")).toBe(587);
  expect(names.typeId("リフター")).toBe(587);
});

test("misses", () => {
  expect(names.typeId("not a type at all")).toBeUndefined();
});
