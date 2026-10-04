import type { Fit } from "@eveshipfit/fitting";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, expect, test, vi } from "vitest";

import { LocalFits, type LocalFitsOptions } from "../src/index.js";

const opened: LocalFits[] = [];
let databases = 0;

function database(): Required<LocalFitsOptions> {
  return { factory: new IDBFactory(), name: `fits-${++databases}` };
}

function open(options: LocalFitsOptions): LocalFits {
  const fits = new LocalFits(options);
  opened.push(fits);
  return fits;
}

afterEach(async () => {
  await Promise.all(opened.splice(0).map((fits) => fits.close()));
});

const brawler: Fit = { name: "Brawler", ship: { type_id: 587 }, items: [] };
const kiter: Fit = { name: "Kiter", ship: { type_id: 587 }, items: [] };

test("saves and lists", async () => {
  const db = database();
  const fits = open(db);
  const saved = [fits.save(brawler), fits.save(kiter)];
  expect(fits.list()).toEqual([brawler, kiter]);
  await Promise.all(saved);

  const again = open(db);
  await vi.waitFor(() => expect(again.list()).toEqual([brawler, kiter]));
});

test("the same ship and name overwrites", async () => {
  const fits = open(database());
  await fits.save(brawler);
  const updated = { ...brawler, items: [{ type_id: 2048, slot: { type: "low", index: 0 }, state: "active" }] } as Fit;
  await fits.save(updated);

  expect(fits.list()).toEqual([updated]);
});

test("removes", async () => {
  const db = database();
  const fits = open(db);
  await fits.save(brawler);
  await fits.save(kiter);
  await fits.remove(brawler);
  expect(fits.list()).toEqual([kiter]);

  const again = open(db);
  await vi.waitFor(() => expect(again.list()).toEqual([kiter]));
});

test("the list only changes identity when it changes, and says so", async () => {
  const fits = open(database());
  const listener = vi.fn<() => void>();
  fits.subscribe(listener);

  const before = fits.list();
  expect(fits.list()).toBe(before);
  const saved = fits.save(brawler);
  expect(fits.list()).not.toBe(before);
  expect(listener).toHaveBeenCalledOnce();
  await saved;
});

test("another tab saving keeps what this one saved, and shows up here", async () => {
  const db = database();
  const one = open(db);
  const other = open(db);
  await one.save(brawler);
  await other.save(kiter);

  await vi.waitFor(() => expect(one.list()).toEqual([brawler, kiter]));
  expect(other.list()).toEqual([brawler, kiter]);
});

test("a character's fits are kept apart from the browser's, by fitting ID", async () => {
  const db = database();
  const fits = open(db);
  await fits.save(brawler);
  await fits.setCharacterFits(
    90000001,
    new Map([
      [1, kiter],
      [2, kiter],
    ]),
  );

  expect(fits.list()).toEqual([brawler]);
  expect(fits.list(90000001)).toEqual([kiter, kiter]);
  expect(fits.list(90000002)).toEqual([]);

  const again = open(db);
  await vi.waitFor(() => expect(again.list(90000001)).toEqual([kiter, kiter]));
  expect(again.list()).toEqual([brawler]);
});

test("a character's fits replace the ones it had, and leave the others", async () => {
  const db = database();
  const fits = open(db);
  await fits.setCharacterFits(
    90000001,
    new Map([
      [1, brawler],
      [2, kiter],
    ]),
  );
  await fits.setCharacterFits(90000002, new Map([[1, brawler]]));

  await fits.save(brawler);

  await fits.setCharacterFits(90000001, new Map([[2, kiter]]));
  await fits.setCharacterFits(90000002, new Map());

  expect(fits.list(90000001)).toEqual([kiter]);
  const again = open(db);
  await vi.waitFor(() => expect(again.list(90000001)).toEqual([kiter]));
  expect(again.list(90000002)).toEqual([]);
  expect(again.list()).toEqual([brawler]);
});
