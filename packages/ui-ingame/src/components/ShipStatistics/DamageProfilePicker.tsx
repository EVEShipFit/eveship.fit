import type { DamageProfile } from "@eveshipfit/fitting";
import { UNIFORM, useDamageProfiles, type NamedDamageProfile } from "@eveshipfit/react-hooks";
import { useId, useRef, useState, type CSSProperties } from "react";

import { Dialog } from "../../primitives/Dialog/Dialog";
import { Icon } from "../../primitives/Icon/Icon";
import type { DamageType } from "../../primitives/ResistanceBar/ResistanceBar";
import { damageNames, damageTypes } from "./Resistances";
import styles from "./ShipStatistics.module.css";

const UNIFORM_NAME = "Uniform";

/** Each damage type's share of `profile`, against the largest one. */
export function DamageShares({ profile }: { profile: DamageProfile }) {
  const largest = Math.max(...damageTypes.map((damage) => profile[damage] ?? 0));
  const total = damageTypes.reduce((sum, damage) => sum + (profile[damage] ?? 0), 0);

  return damageTypes.map((damage) => (
    <span
      key={damage}
      className={styles.share}
      data-damage={damage}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <meter> cannot be styled the same in every browser.
      role="meter"
      aria-label={`Incoming ${damageNames[damage]} Damage`}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={(profile[damage] ?? 0) / total}
      style={{ "--share": (profile[damage] ?? 0) / largest } as CSSProperties}
    />
  ));
}

/** Which damage profile the ehp is for; click it to pick another, or to make one. */
export function DamageProfilePicker() {
  const { profiles, current, select, save, remove } = useDamageProfiles();
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [editing, setEditing] = useState<NamedDamageProfile | "new">();
  const shown = current ?? UNIFORM_NAME;

  const pick = (name: string | undefined) => {
    select(name);
    menu.current?.hidePopover();
  };
  const edit = (profile: NamedDamageProfile | "new") => {
    setEditing(profile);
    menu.current?.hidePopover();
  };

  return (
    <div
      className={styles.damageProfile}
      style={{ "--damage-profile-anchor": `--damage-profile-${menuId.replace(/[^\w-]/g, "")}` } as CSSProperties}
    >
      <span className={styles.damageProfileLabel}>Damage profile</span>
      <button
        type="button"
        className={styles.damageProfilePicker}
        aria-label={`Damage profile: ${shown}`}
        popoverTarget={menuId}
      >
        <span className={styles.damageProfileName}>{shown}</span>
        <Icon name="arrow-down" />
      </button>
      <div ref={menu} id={menuId} className={styles.damageProfileMenu} popover="auto">
        <button
          type="button"
          className={styles.pick}
          aria-pressed={current === undefined}
          onClick={() => pick(undefined)}
        >
          {UNIFORM_NAME}
        </button>
        {profiles.map((profile) => (
          <div key={profile.name} className={styles.custom}>
            <button
              type="button"
              className={styles.pick}
              aria-pressed={profile.name === current}
              onClick={() => pick(profile.name)}
            >
              {profile.name}
            </button>
            <button
              type="button"
              className={styles.edit}
              aria-label={`Edit ${profile.name}`}
              onClick={() => edit(profile)}
            >
              Edit
            </button>
          </div>
        ))}
        <hr className={styles.rule} />
        <button type="button" className={styles.pick} onClick={() => edit("new")}>
          New profile…
        </button>
      </div>
      <Dialog
        open={editing !== undefined}
        title={editing === "new" ? "New Damage Profile" : "Edit Damage Profile"}
        onClose={() => setEditing(undefined)}
      >
        {editing !== undefined && (
          <ProfileForm
            editing={editing === "new" ? undefined : editing}
            taken={profiles.map((profile) => profile.name)}
            onCancel={() => setEditing(undefined)}
            onSave={(profile) => {
              save(profile, editing === "new" ? undefined : editing.name);
              if (editing === "new") select(profile.name);
              setEditing(undefined);
            }}
            onDelete={() => {
              if (editing !== "new") remove(editing.name);
              setEditing(undefined);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

interface ProfileFormProps {
  editing: NamedDamageProfile | undefined;
  taken: readonly string[];
  onCancel: () => void;
  onSave: (profile: NamedDamageProfile) => void;
  onDelete: () => void;
}

function ProfileForm({ editing, taken, onCancel, onSave, onDelete }: ProfileFormProps) {
  const id = useId();
  const [name, setName] = useState(editing?.name ?? "");
  const [amounts, setAmounts] = useState<Record<DamageType, string>>(() => {
    const profile = editing?.profile ?? UNIFORM;
    return {
      em: String(profile.em ?? 0),
      thermal: String(profile.thermal ?? 0),
      kinetic: String(profile.kinetic ?? 0),
      explosive: String(profile.explosive ?? 0),
    };
  });

  const profile = Object.fromEntries(
    damageTypes.map((damage) => [damage, Math.max(0, Number(amounts[damage]) || 0)]),
  ) as Required<DamageProfile>;
  const trimmed = name.trim();
  const clash = trimmed === UNIFORM_NAME || (trimmed !== editing?.name && taken.includes(trimmed));
  const empty = damageTypes.every((damage) => profile[damage] === 0);

  return (
    <form
      className={styles.profileForm}
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name: trimmed, profile });
      }}
    >
      <label htmlFor={id}>Name</label>
      <input id={id} value={name} onChange={(event) => setName(event.target.value)} />
      {clash && <p className={styles.formError}>There is already a profile named &quot;{trimmed}&quot;.</p>}
      <div className={styles.amounts}>
        {damageTypes.map((damage) => (
          <label key={damage} className={styles.amount}>
            <Icon name={`stat-${damage}-resistance`} />
            <input
              type="number"
              min={0}
              aria-label={damageNames[damage]}
              value={amounts[damage]}
              onChange={(event) => setAmounts({ ...amounts, [damage]: event.target.value })}
            />
          </label>
        ))}
        {!empty && <DamageShares profile={profile} />}
      </div>
      <div className={styles.dialogButtons}>
        {editing !== undefined && (
          <button type="button" className={`${styles.action} ${styles.delete}`} onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className={styles.action} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.action} disabled={trimmed === "" || clash || empty}>
          Save
        </button>
      </div>
    </form>
  );
}
