import {
  SsoError,
  type CharacterFitting,
  type CharacterSkills,
  type Esi,
  type SkillQueueEntry,
  type Sso,
  type SsoLogin,
} from "@eveshipfit/esi";
import type { Engine, Fit } from "@eveshipfit/fitting";

import type { LocalFits } from "./local-fits.js";

/** The part of the Web Storage API this needs. */
export type CharacterStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface EsiCharactersOptions {
  esi: Esi;
  sso: Sso;
  /** Turns the characters' fittings into fits. */
  engine: Promise<Engine>;
  /** Where the characters' fittings live. */
  localFits: LocalFits;
  /** Where the characters live; `localStorage` when left out. */
  storage?: CharacterStorage;
  /** Where a login in progress lives; `sessionStorage` when left out. */
  session?: CharacterStorage;
}

export type EsiCharacterStatus = "loading" | "ready" | "expired" | "failed";

/** A character logged in through EVE's login. */
export interface EsiCharacter {
  readonly id: number;
  readonly name: string;
  /** Levels by skill type ID, with what the skill queue finished; undefined until first loaded. */
  readonly skills: Readonly<Record<number, number>> | undefined;
  /** When `skills` were loaded, in milliseconds since the epoch. */
  readonly updated: number | undefined;
  readonly status: EsiCharacterStatus;
  /** Whether the login may read the character's fittings. */
  readonly canReadFits: boolean;
}

interface Stored {
  id: number;
  name: string;
  /** Undefined once EVE no longer accepts it. */
  refreshToken: string | undefined;
  scopes?: readonly string[];
  skills?: Record<number, number>;
  updated?: number;
}

const FITTINGS_SCOPE = "esi-fittings.read_fittings.v1";
const SCOPES = ["esi-skills.read_skills.v1", "esi-skills.read_skillqueue.v1", FITTINGS_SCOPE];
const KEY = "eveshipfit.characters";
const LOGIN_KEY = "eveshipfit.login";

/** Characters logged in through EVE's login, kept in the browser. */
export class EsiCharacters {
  readonly #esi: Esi;
  readonly #sso: Sso;
  readonly #engine: Promise<Engine>;
  readonly #localFits: LocalFits;
  readonly #storage: CharacterStorage;
  readonly #session: CharacterStorage;
  readonly #listeners = new Set<() => void>();
  readonly #status = new Map<number, EsiCharacterStatus>();
  readonly #loaded = new Set<number>();
  #stored: readonly Stored[];
  #list: readonly EsiCharacter[] = [];

  constructor({ esi, sso, engine, localFits, storage = localStorage, session = sessionStorage }: EsiCharactersOptions) {
    this.#esi = esi;
    this.#sso = sso;
    this.#engine = engine;
    this.#localFits = localFits;
    this.#storage = storage;
    this.#session = session;
    this.#stored = this.#read();
    this.#publish();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.storageArea !== storage || (event.key !== KEY && event.key !== null)) return;
        this.#stored = this.#read();
        this.#publish();
      });
    }
  }

  /** Sorted by name. */
  list = (): readonly EsiCharacter[] => this.#list;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** The URL of EVE's login, to send the user to. */
  async login(): Promise<string> {
    const { url, state, verifier } = await this.#sso.authorize(SCOPES);
    this.#session.setItem(LOGIN_KEY, JSON.stringify({ state, verifier }));
    return url;
  }

  /** Finishes a login with the `code` and `state` EVE sent the user back with; the character's ID. */
  async finishLogin(code: string, state: string): Promise<number> {
    const pending = this.#session.getItem(LOGIN_KEY);
    this.#session.removeItem(LOGIN_KEY);
    const { state: expected, verifier } = (pending === null ? {} : JSON.parse(pending)) as {
      state?: string;
      verifier?: string;
    };
    if (verifier === undefined || state !== expected) throw new Error("This login was not started here");

    const login = await this.#sso.login(code, verifier);
    this.#loaded.add(login.characterId);
    this.#change(login.characterId, (known) => ({
      ...known,
      id: login.characterId,
      name: login.name,
      refreshToken: login.refreshToken,
      scopes: login.scopes,
    }));
    void this.#load(login);
    return login.characterId;
  }

  /** Loads the character's skills and fittings from ESI, once per page. */
  load(id: number) {
    if (!this.#loaded.has(id)) this.refresh(id);
  }

  /** Loads every character's skills and fittings from ESI, once per page; this also keeps their logins alive. */
  loadAll() {
    for (const { id } of this.#stored) this.load(id);
  }

  /** Loads the character's skills and fittings from ESI again. */
  refresh(id: number) {
    const refreshToken = this.#stored.find((character) => character.id === id)?.refreshToken;
    if (refreshToken === undefined || this.#status.get(id) === "loading") return;
    this.#loaded.add(id);
    void this.#refresh(id, refreshToken);
  }

  /** Forgets the character and its fittings, and revokes its login at EVE. */
  remove(id: number) {
    const refreshToken = this.#stored.find((character) => character.id === id)?.refreshToken;
    this.#status.delete(id);
    this.#change(id, () => undefined);
    this.#localFits.setCharacterFits(id, new Map()).catch((error: unknown) => console.error(error));
    if (refreshToken !== undefined) this.#sso.revoke(refreshToken).catch((error: unknown) => console.error(error));
  }

  async #refresh(id: number, refreshToken: string): Promise<void> {
    this.#setStatus(id, "loading");
    let login: SsoLogin;
    try {
      login = await this.#sso.refresh(refreshToken);
    } catch (error) {
      if (error instanceof SsoError && error.error === "invalid_grant") {
        const latest = this.#read().find((character) => character.id === id)?.refreshToken;
        if (latest !== undefined && latest !== refreshToken) {
          this.#update(id, { refreshToken: latest });
          return this.#refresh(id, latest);
        }
        this.#status.delete(id);
        this.#update(id, { refreshToken: undefined });
      } else {
        console.error(error);
        this.#setStatus(id, "failed");
      }
      return;
    }
    this.#update(id, { name: login.name, refreshToken: login.refreshToken, scopes: login.scopes });
    await this.#load(login);
  }

  async #load(login: SsoLogin) {
    await Promise.all([this.#loadSkills(login), this.#loadFittings(login)]);
  }

  async #loadFittings({ characterId, accessToken, scopes }: SsoLogin) {
    if (!scopes.includes(FITTINGS_SCOPE)) return;
    try {
      const [fittings, engine] = await Promise.all([
        this.#esi.characterFittings(characterId, accessToken),
        this.#engine,
      ]);
      if (!this.#read().some((character) => character.id === characterId)) return;
      await this.#localFits.setCharacterFits(characterId, new Map(fittings.flatMap((one) => fitOf(engine, one))));
    } catch (error) {
      console.error(error);
    }
  }

  async #loadSkills({ characterId, accessToken }: SsoLogin) {
    this.#setStatus(characterId, "loading");
    try {
      const [skills, queue] = await Promise.all([
        this.#esi.characterSkills(characterId, accessToken),
        this.#esi.characterSkillQueue(characterId, accessToken).catch((error: unknown) => {
          console.error(error);
          return [];
        }),
      ]);
      const now = Date.now();
      this.#status.delete(characterId);
      this.#update(characterId, { skills: trainedLevels(skills, queue, now), updated: now });
    } catch (error) {
      console.error(error);
      this.#setStatus(characterId, "failed");
    }
  }

  #update(id: number, changes: Partial<Stored>) {
    this.#change(id, (character) => character && { ...character, ...changes });
  }

  /** Changes one character on top of what is stored, which other tabs may have changed. */
  #change(id: number, change: (character: Stored | undefined) => Stored | undefined) {
    const stored = this.#read();
    const changed = change(stored.find((character) => character.id === id));
    const others = stored.filter((character) => character.id !== id);
    this.#stored = changed === undefined ? others : [...others, changed];
    this.#storage.setItem(KEY, JSON.stringify(this.#stored));
    this.#publish();
  }

  #setStatus(id: number, status: EsiCharacterStatus) {
    if (!this.#stored.some((character) => character.id === id)) return;
    this.#status.set(id, status);
    this.#publish();
  }

  #read(): readonly Stored[] {
    const stored = this.#storage.getItem(KEY);
    if (stored === null) return [];
    try {
      const characters: unknown = JSON.parse(stored);
      return Array.isArray(characters) ? (characters as Stored[]) : [];
    } catch {
      return [];
    }
  }

  #publish() {
    this.#list = this.#stored
      .map(({ id, name, refreshToken, scopes, skills, updated }) => ({
        id,
        name,
        skills,
        updated,
        status: this.#status.get(id) ?? (refreshToken === undefined ? "expired" : "ready"),
        canReadFits: scopes?.includes(FITTINGS_SCOPE) ?? false,
      }))
      .toSorted((a, b) => a.name.localeCompare(b.name));
    for (const listener of this.#listeners) listener();
  }
}

/** The fitting as a fit with its fitting ID; none when the engine cannot read it. */
function fitOf(engine: Engine, fitting: CharacterFitting): [number, Fit][] {
  try {
    return [[fitting.fitting_id, engine.loadEsiFitting(fitting)]];
  } catch (error) {
    console.error(error);
    return [];
  }
}

/** The level of every skill, counting what the queue finished since the character was last in game. */
function trainedLevels({ skills }: CharacterSkills, queue: readonly SkillQueueEntry[], now: number) {
  const levels: Record<number, number> = {};
  const capped = new Set<number>();
  for (const skill of skills) {
    levels[skill.skill_id] = skill.active_skill_level;
    if (skill.active_skill_level < skill.trained_skill_level) capped.add(skill.skill_id);
  }
  for (const { skill_id, finished_level, finish_date } of queue) {
    if (finish_date === undefined || Date.parse(finish_date) > now || capped.has(skill_id)) continue;
    levels[skill_id] = Math.max(levels[skill_id] ?? 0, finished_level);
  }
  return levels;
}
