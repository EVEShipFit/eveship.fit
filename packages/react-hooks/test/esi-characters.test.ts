import { SsoError, type CharacterFitting, type Esi, type Sso, type SsoLogin } from "@eveshipfit/esi";
import type { Engine, Fit } from "@eveshipfit/fitting";
import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { EsiCharacters, type CharacterStorage, type LocalFits } from "../src/index.js";

const PILOT = 90000001;
const RIFTER = 587;
const SCOPES = ["esi-skills.read_skills.v1", "esi-skills.read_skillqueue.v1", "esi-fittings.read_fittings.v1"];
const GUNNERY = 3300;
const NAVIGATION = 3449;

function memoryStorage(): CharacterStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

const login = (refreshToken = "refresh"): SsoLogin => ({
  characterId: PILOT,
  name: "Pilot",
  scopes: SCOPES,
  accessToken: "access",
  refreshToken,
});

let sso: {
  authorize: Mock<Sso["authorize"]>;
  login: Mock<Sso["login"]>;
  refresh: Mock<Sso["refresh"]>;
  revoke: Mock<Sso["revoke"]>;
};
let esi: {
  characterSkills: Mock<Esi["characterSkills"]>;
  characterSkillQueue: Mock<Esi["characterSkillQueue"]>;
  characterFittings: Mock<Esi["characterFittings"]>;
};
let engine: { loadEsiFitting: Mock<Engine["loadEsiFitting"]> };
let localFits: { setCharacterFits: Mock<LocalFits["setCharacterFits"]> };
let storage: CharacterStorage;
let session: CharacterStorage;

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-03T12:00:00Z") });
  sso = {
    authorize: vi.fn<Sso["authorize"]>(async () => ({
      url: "https://login.eveonline.com/",
      state: "state",
      verifier: "verifier",
    })),
    login: vi.fn<Sso["login"]>(async () => login()),
    refresh: vi.fn<Sso["refresh"]>(async () => login("rotated")),
    revoke: vi.fn<Sso["revoke"]>(async () => {}),
  };
  esi = {
    characterSkills: vi.fn<Esi["characterSkills"]>(async () => ({
      skills: [{ skill_id: GUNNERY, active_skill_level: 3, trained_skill_level: 3, skillpoints_in_skill: 0 }],
      total_sp: 0,
    })),
    characterSkillQueue: vi.fn<Esi["characterSkillQueue"]>(async () => []),
    characterFittings: vi.fn<Esi["characterFittings"]>(async () => [fitting(1, "Fleet Rifter")]),
  };
  engine = {
    loadEsiFitting: vi.fn<Engine["loadEsiFitting"]>((one) => ({
      name: one.name,
      ship: { type_id: one.ship_type_id },
      items: [],
    })),
  };
  localFits = { setCharacterFits: vi.fn<LocalFits["setCharacterFits"]>(async () => {}) };
  storage = memoryStorage();
  session = memoryStorage();
});

afterEach(() => {
  vi.useRealTimers();
});

const characters = () =>
  new EsiCharacters({
    esi: esi as unknown as Esi,
    sso: sso as unknown as Sso,
    engine: Promise.resolve(engine as unknown as Engine),
    localFits: localFits as unknown as LocalFits,
    storage,
    session,
  });

function fitting(id: number, name: string): CharacterFitting {
  return { fitting_id: id, name, description: "", ship_type_id: RIFTER, items: [] };
}

const fit = (name: string): Fit => ({ name, ship: { type_id: RIFTER }, items: [] });

async function loggedIn(): Promise<EsiCharacters> {
  const store = characters();
  await store.login();
  await store.finishLogin("code", "state");
  await vi.runAllTimersAsync();
  return store;
}

test("a login adds the character with its skills, and is kept in storage", async () => {
  const store = await loggedIn();

  expect(sso.login).toHaveBeenCalledWith("code", "verifier");
  expect(store.list()).toEqual([
    { id: PILOT, name: "Pilot", skills: { [GUNNERY]: 3 }, updated: Date.now(), status: "ready", canReadFits: true },
  ]);
  expect(characters().list()).toEqual(store.list());
});

test("a login that was not started here fails", async () => {
  const store = characters();
  await store.login();

  await expect(store.finishLogin("code", "other")).rejects.toThrow("This login was not started here");
  expect(sso.login).not.toHaveBeenCalled();
});

test("a login returns before the skills are in", async () => {
  const { promise, resolve } = Promise.withResolvers<Awaited<ReturnType<Esi["characterSkills"]>>>();
  esi.characterSkills.mockReturnValue(promise);
  const store = characters();
  await store.login();

  await expect(store.finishLogin("code", "state")).resolves.toBe(PILOT);
  expect(store.list()[0]!.status).toBe("loading");

  resolve({ skills: [], total_sp: 0 });
  await vi.runAllTimersAsync();
  expect(store.list()[0]!.status).toBe("ready");
});

test("skills the queue finished count as trained", async () => {
  esi.characterSkillQueue.mockResolvedValue([
    { skill_id: GUNNERY, finished_level: 4, queue_position: 0, finish_date: "2026-10-03T11:00:00Z" },
    { skill_id: GUNNERY, finished_level: 5, queue_position: 1, finish_date: "2026-10-04T11:00:00Z" },
    { skill_id: NAVIGATION, finished_level: 1, queue_position: 2, finish_date: "2026-10-03T11:30:00Z" },
  ]);

  const store = await loggedIn();

  expect(store.list()[0]!.skills).toEqual({ [GUNNERY]: 4, [NAVIGATION]: 1 });
});

test("the queue does not raise a skill an Alpha clone is capped at", async () => {
  esi.characterSkills.mockResolvedValue({
    skills: [{ skill_id: GUNNERY, active_skill_level: 4, trained_skill_level: 5, skillpoints_in_skill: 0 }],
    total_sp: 0,
  });
  esi.characterSkillQueue.mockResolvedValue([
    { skill_id: GUNNERY, finished_level: 5, queue_position: 0, finish_date: "2026-10-03T11:00:00Z" },
  ]);

  const store = await loggedIn();

  expect(store.list()[0]!.skills).toEqual({ [GUNNERY]: 4 });
});

test("skills load without the queue when it fails", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  esi.characterSkillQueue.mockRejectedValue(new Error("403"));

  const store = await loggedIn();

  expect(store.list()[0]).toMatchObject({ status: "ready", skills: { [GUNNERY]: 3 } });
});

test("skills that fail to load keep the ones from before", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  await loggedIn();
  esi.characterSkills.mockRejectedValue(new Error("503"));
  const store = characters();

  store.load(PILOT);
  await vi.runAllTimersAsync();

  expect(store.list()[0]).toMatchObject({ status: "failed", skills: { [GUNNERY]: 3 } });
});

test("a tab does not undo what another tab stored", async () => {
  const tab = characters();
  await loggedIn();
  sso.login.mockResolvedValue({ ...login("other"), characterId: PILOT + 1, name: "Other" });
  await loggedIn();

  tab.refresh(PILOT);
  await vi.runAllTimersAsync();

  expect(
    characters()
      .list()
      .map((character) => character.name),
  ).toEqual(["Other", "Pilot"]);
});

test("loading refreshes the token once per page", async () => {
  await loggedIn();
  const store = characters();

  store.load(PILOT);
  store.load(PILOT);
  expect(store.list()[0]!.status).toBe("loading");
  await vi.runAllTimersAsync();

  expect(sso.refresh).toHaveBeenCalledExactlyOnceWith("refresh");
  expect(store.list()[0]!.status).toBe("ready");
  store.load(PILOT);
  expect(sso.refresh).toHaveBeenCalledTimes(1);
});

test("loading all skips who already loaded; a refresh loads again", async () => {
  const store = await loggedIn();

  store.loadAll();
  expect(sso.refresh).not.toHaveBeenCalled();

  store.refresh(PILOT);
  store.refresh(PILOT);
  await vi.runAllTimersAsync();
  expect(sso.refresh).toHaveBeenCalledExactlyOnceWith("refresh");
  expect(esi.characterSkills).toHaveBeenCalledTimes(2);
});

test("a refresh token another tab used first is swapped for the one it stored", async () => {
  await loggedIn();
  const store = characters();
  const otherTab = characters();
  sso.refresh.mockResolvedValueOnce(login("other"));
  otherTab.load(PILOT);
  await vi.runAllTimersAsync();
  sso.refresh.mockRejectedValueOnce(new SsoError(400, "invalid_grant", undefined));

  store.load(PILOT);
  await vi.runAllTimersAsync();

  expect(sso.refresh).toHaveBeenLastCalledWith("other");
  expect(store.list()[0]!.status).toBe("ready");
});

test("a refresh token EVE no longer accepts expires the login, and keeps the skills", async () => {
  await loggedIn();
  sso.refresh.mockRejectedValue(new SsoError(400, "invalid_grant", undefined));
  const store = characters();

  store.load(PILOT);
  await vi.runAllTimersAsync();

  expect(store.list()[0]).toMatchObject({ status: "expired", skills: { [GUNNERY]: 3 } });
});

test("a login keeps the character's fittings as its fits", async () => {
  await loggedIn();

  expect(esi.characterFittings).toHaveBeenCalledWith(PILOT, "access");
  expect(localFits.setCharacterFits).toHaveBeenCalledExactlyOnceWith(PILOT, new Map([[1, fit("Fleet Rifter")]]));
});

test("a fitting the engine cannot read is left out", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  esi.characterFittings.mockResolvedValue([fitting(1, "Broken"), fitting(2, "Fleet Rifter")]);
  engine.loadEsiFitting.mockImplementationOnce(() => {
    throw new Error("unknown type");
  });

  await loggedIn();

  expect(localFits.setCharacterFits).toHaveBeenCalledExactlyOnceWith(PILOT, new Map([[2, fit("Fleet Rifter")]]));
});

test("fittings that fail to load keep the fits from before", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  esi.characterFittings.mockRejectedValue(new Error("503"));

  const store = await loggedIn();

  expect(localFits.setCharacterFits).not.toHaveBeenCalled();
  expect(store.list()[0]!.status).toBe("ready");
});

test("a login from before fittings were asked for cannot read them", async () => {
  sso.login.mockResolvedValue({ ...login(), scopes: SCOPES.slice(0, 2) });

  const store = await loggedIn();

  expect(esi.characterFittings).not.toHaveBeenCalled();
  expect(store.list()[0]!.canReadFits).toBe(false);
});

test("a removed character is forgotten with its fits, and its login revoked", async () => {
  const store = await loggedIn();

  store.remove(PILOT);

  expect(store.list()).toEqual([]);
  expect(characters().list()).toEqual([]);
  expect(localFits.setCharacterFits).toHaveBeenLastCalledWith(PILOT, new Map());
  expect(sso.revoke).toHaveBeenCalledWith("refresh");
});

test("a character removed while it loads stays removed", async () => {
  const store = await loggedIn();

  store.refresh(PILOT);
  store.remove(PILOT);
  await vi.runAllTimersAsync();

  expect(store.list()).toEqual([]);
  expect(characters().list()).toEqual([]);
  expect(localFits.setCharacterFits).toHaveBeenLastCalledWith(PILOT, new Map());
});
