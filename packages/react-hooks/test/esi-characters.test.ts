import { SsoError, type Esi, type Sso, type SsoLogin } from "@eveshipfit/esi";
import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { EsiCharacters, type CharacterStorage } from "../src/index.js";

const PILOT = 90000001;
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
  accessToken: "access",
  refreshToken,
});

let sso: { authorize: Mock<Sso["authorize"]>; login: Mock<Sso["login"]>; refresh: Mock<Sso["refresh"]> };
let esi: { characterSkills: Mock<Esi["characterSkills"]>; characterSkillQueue: Mock<Esi["characterSkillQueue"]> };
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
  };
  esi = {
    characterSkills: vi.fn<Esi["characterSkills"]>(async () => ({
      skills: [{ skill_id: GUNNERY, active_skill_level: 3, trained_skill_level: 3, skillpoints_in_skill: 0 }],
      total_sp: 0,
    })),
    characterSkillQueue: vi.fn<Esi["characterSkillQueue"]>(async () => []),
  };
  storage = memoryStorage();
  session = memoryStorage();
});

afterEach(() => {
  vi.useRealTimers();
});

const characters = () =>
  new EsiCharacters({ esi: esi as unknown as Esi, sso: sso as unknown as Sso, storage, session });

async function loggedIn(): Promise<EsiCharacters> {
  const store = characters();
  await store.login();
  await store.finishLogin("code", "state");
  return store;
}

test("a login adds the character with its skills, and is kept in storage", async () => {
  const store = await loggedIn();

  expect(sso.login).toHaveBeenCalledWith("code", "verifier");
  expect(store.list()).toEqual([
    { id: PILOT, name: "Pilot", skills: { [GUNNERY]: 3 }, updated: Date.now(), status: "ready" },
  ]);
  expect(characters().list()).toEqual(store.list());
});

test("a login that was not started here fails", async () => {
  const store = characters();
  await store.login();

  await expect(store.finishLogin("code", "other")).rejects.toThrow("This login was not started here");
  expect(sso.login).not.toHaveBeenCalled();
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

test("a removed character is forgotten", async () => {
  const store = await loggedIn();

  store.remove(PILOT);

  expect(store.list()).toEqual([]);
  expect(characters().list()).toEqual([]);
});
