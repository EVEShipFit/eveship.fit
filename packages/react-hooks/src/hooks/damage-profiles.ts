import type { DamageProfile, FitStore } from "@eveshipfit/fitting";
import { useEffect, useSyncExternalStore } from "react";

import { DamageProfileContext, DamageProfilesContext, useRequiredContext } from "../context.js";
import type { DamageProfiles, NamedDamageProfile } from "../damage-profiles.js";

export const UNIFORM: DamageProfile = { em: 25, thermal: 25, kinetic: 25, explosive: 25 };

export interface DamageProfilesControls {
  /** The ones people made, in the order they were made. */
  readonly profiles: readonly NamedDamageProfile[];
  /** The name of the profile the ehp is for; undefined for uniform. */
  readonly current: string | undefined;
  /** The profile the ehp is for. */
  readonly profile: DamageProfile;
  readonly select: (name: string | undefined) => void;
  /** Takes the place of `replacing`, or of the profile with the same name. */
  readonly save: (profile: NamedDamageProfile, replacing?: string) => void;
  readonly remove: (name: string) => void;
}

export function useDamageProfiles(): DamageProfilesControls {
  const damageProfiles = useRequiredContext(DamageProfilesContext);
  const { current: picked, setCurrent } = useRequiredContext(DamageProfileContext);
  const profiles = useSyncExternalStore(damageProfiles.subscribe, damageProfiles.list);
  const found = profiles.find((one) => one.name === picked);
  const current = found?.name;

  return {
    profiles,
    current,
    profile: found?.profile ?? UNIFORM,
    select: setCurrent,
    save: (profile, replacing) => {
      damageProfiles.save(profile, replacing);
      if (replacing !== undefined && replacing === current) setCurrent(profile.name);
    },
    remove: (name) => {
      damageProfiles.remove(name);
      if (name === current) setCurrent(undefined);
    },
  };
}

/** Calculates `store` for the profile named `current`. */
export function useApplyDamageProfile(store: FitStore, damageProfiles: DamageProfiles, current: string | undefined) {
  const profiles = useSyncExternalStore(damageProfiles.subscribe, damageProfiles.list);
  const profile = profiles.find((one) => one.name === current)?.profile;

  useEffect(() => {
    if (store.damageProfile !== profile) store.setDamageProfile(profile);
  }, [store, profile]);
}
