import type { Fit } from "@eveshipfit/fitting";
import { expect, test, vi } from "vitest";

import { LocalFits, type FitStorage } from "../src/index.js";

function memoryStorage(): FitStorage & { items: Map<string, string> } {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
}

const brawler: Fit = { name: "Brawler", ship: { type_id: 587 }, items: [] };
const kiter: Fit = { name: "Kiter", ship: { type_id: 587 }, items: [] };

test("saves and lists", () => {
  const storage = memoryStorage();
  const fits = new LocalFits(storage);
  fits.save(brawler);
  fits.save(kiter);

  expect(fits.list()).toEqual([brawler, kiter]);
  expect(new LocalFits(storage).list()).toEqual([brawler, kiter]);
});

test("the same ship and name overwrites", () => {
  const fits = new LocalFits(memoryStorage());
  fits.save(brawler);
  const updated = { ...brawler, items: [{ type_id: 2048, slot: { type: "low", index: 0 }, state: "active" }] } as Fit;
  fits.save(updated);

  expect(fits.list()).toEqual([updated]);
});

test("removes", () => {
  const fits = new LocalFits(memoryStorage());
  fits.save(brawler);
  fits.save(kiter);
  fits.remove(brawler);

  expect(fits.list()).toEqual([kiter]);
});

test("the list only changes identity when it changes, and says so", () => {
  const fits = new LocalFits(memoryStorage());
  const listener = vi.fn<() => void>();
  fits.subscribe(listener);

  const before = fits.list();
  expect(fits.list()).toBe(before);
  fits.save(brawler);
  expect(fits.list()).not.toBe(before);
  expect(listener).toHaveBeenCalledOnce();
});

test("survives storage it cannot read", () => {
  const storage = memoryStorage();
  storage.setItem("eveshipfit.fits", "{not json");
  expect(new LocalFits(storage).list()).toEqual([]);
});
