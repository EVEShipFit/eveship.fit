import { expect, test } from "vitest";

import { DamageProfiles } from "../src/index.js";

const em = { em: 1, thermal: 0, kinetic: 0, explosive: 0 };
const thermal = { em: 0, thermal: 1, kinetic: 0, explosive: 0 };

function memoryStorage(items = new Map<string, string>()) {
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

test("profiles are kept in storage", () => {
  const storage = memoryStorage();
  new DamageProfiles({ storage }).save({ name: "EM", profile: em });
  expect(new DamageProfiles({ storage }).list()).toEqual([{ name: "EM", profile: em }]);
});

test("saving replaces in place, also when renaming", () => {
  const profiles = new DamageProfiles({ storage: memoryStorage() });
  profiles.save({ name: "A", profile: em });
  profiles.save({ name: "B", profile: em });
  profiles.save({ name: "A", profile: thermal });
  expect(profiles.list().map(({ name, profile }) => [name, profile])).toEqual([
    ["A", thermal],
    ["B", em],
  ]);

  profiles.save({ name: "C", profile: thermal }, "A");
  expect(profiles.list().map(({ name }) => name)).toEqual(["C", "B"]);

  profiles.save({ name: "B", profile: thermal }, "C");
  expect(profiles.list()).toEqual([{ name: "B", profile: thermal }]);
});

test("remove", () => {
  const profiles = new DamageProfiles({ storage: memoryStorage() });
  profiles.save({ name: "A", profile: em });
  profiles.remove("A");
  expect(profiles.list()).toEqual([]);
});

test("broken entries are skipped", () => {
  const items = new Map([
    [
      "eveshipfit.damage-profiles",
      JSON.stringify([
        { name: "Good", profile: em },
        { name: "Zero", profile: { em: 0, thermal: 0, kinetic: 0, explosive: 0 } },
        { name: "Negative", profile: { em: -1, thermal: 1, kinetic: 0, explosive: 0 } },
        { name: 1, profile: em },
        "nonsense",
      ]),
    ],
  ]);
  expect(new DamageProfiles({ storage: memoryStorage(items) }).list()).toEqual([{ name: "Good", profile: em }]);

  items.set("eveshipfit.damage-profiles", "{");
  expect(new DamageProfiles({ storage: memoryStorage(items) }).list()).toEqual([]);
});
