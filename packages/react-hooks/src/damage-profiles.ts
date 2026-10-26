import type { DamageProfile } from "@eveshipfit/fitting";

export interface NamedDamageProfile {
  readonly name: string;
  readonly profile: DamageProfile;
}

export interface DamageProfilesOptions {
  /** `localStorage` when left out. */
  storage?: Pick<Storage, "getItem" | "setItem">;
  key?: string;
}

const damageTypes = ["em", "thermal", "kinetic", "explosive"] as const;

/** The damage profiles people made, kept in Web Storage by name. */
export class DamageProfiles {
  readonly #storage: Pick<Storage, "getItem" | "setItem"> | undefined;
  readonly #key: string;
  readonly #listeners = new Set<() => void>();
  #profiles: readonly NamedDamageProfile[];

  constructor({ storage, key = "eveshipfit.damage-profiles" }: DamageProfilesOptions = {}) {
    this.#storage = storage ?? defaultStorage();
    this.#key = key;
    this.#profiles = this.#read();
    globalThis.addEventListener?.("storage", (event) => {
      if (event.key !== this.#key) return;
      this.#profiles = this.#read();
      this.#notify();
    });
  }

  list = (): readonly NamedDamageProfile[] => this.#profiles;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** Takes the place of `replacing`, or of the profile with the same name; otherwise goes at the end. */
  save(profile: NamedDamageProfile, replacing = profile.name) {
    const others = this.#profiles.filter((one) => one.name !== profile.name || one.name === replacing);
    const index = others.findIndex((one) => one.name === replacing);
    this.#write(index === -1 ? [...others, profile] : others.with(index, profile));
  }

  remove(name: string) {
    this.#write(this.#profiles.filter((one) => one.name !== name));
  }

  #read(): readonly NamedDamageProfile[] {
    try {
      const parsed: unknown = JSON.parse(this.#storage?.getItem(this.#key) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isNamedDamageProfile) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  #write(profiles: readonly NamedDamageProfile[]) {
    this.#profiles = profiles;
    try {
      this.#storage?.setItem(this.#key, JSON.stringify(profiles));
    } catch (error) {
      console.error(error);
    }
    this.#notify();
  }

  #notify() {
    for (const listener of this.#listeners) listener();
  }
}

function defaultStorage(): Storage | undefined {
  try {
    return localStorage;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function isNamedDamageProfile(value: unknown): value is NamedDamageProfile {
  if (typeof value !== "object" || value === null) return false;
  const { name, profile } = value as Record<string, unknown>;
  if (typeof name !== "string" || typeof profile !== "object" || profile === null) return false;
  const amounts = damageTypes.map((type) => (profile as Record<string, unknown>)[type]);
  return (
    amounts.every((amount) => typeof amount === "number" && Number.isFinite(amount) && amount >= 0) &&
    amounts.some((amount) => (amount as number) > 0)
  );
}
