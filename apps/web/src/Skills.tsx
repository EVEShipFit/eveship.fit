import { useCharacters, useFitStore, type CharacterChoice, type EsiCharacter } from "@eveshipfit/react-hooks";
import { useEffect, useId, useRef, useState } from "react";

import { keepFit } from "./login";
import styles from "./Skills.module.css";

const descriptions: Record<string, string> = {
  "All L5": "Every skill at level V",
  "All L0": "No skills at all",
};

const warnings = {
  expired: "Login expired",
  failed: "Could not load skills",
};

/** The button to pick which skills fly the fit, and the card it pops up. */
export function Skills({ loginError }: { loginError?: string }) {
  const id = useId();
  const card = useRef<HTMLDialogElement>(null);
  const store = useFitStore();
  const { characters, current, select, login, refresh, remove } = useCharacters();
  const shown = characters.find((character) => character.id === current);
  const own = characters.filter((character) => character.login !== undefined);
  const generic = characters.filter((character) => character.login === undefined);

  const [error, setError] = useState(loginError);

  useEffect(() => {
    if (loginError !== undefined) card.current?.showPopover();
  }, [loginError]);

  const startLogin =
    login &&
    (() => {
      keepFit(store.getSnapshot().fit);
      login();
    });

  const row = (character: CharacterChoice) => (
    <li key={character.id} className={character.id === current ? `${styles.row} ${styles.current}` : styles.row}>
      <button
        type="button"
        className={styles.pick}
        aria-current={character.id === current}
        onClick={() => {
          select(character.id);
          card.current?.hidePopover();
        }}
      >
        <span className={styles.name}>{character.name}</span>
        <small className={styles.detail}>
          {character.login === undefined ? descriptions[character.name] : <Status login={character.login} />}
        </small>
      </button>
      {character.id === current && <span className={styles.check}>✓</span>}
      {character.login?.status === "expired" && startLogin && (
        <button type="button" className={styles.relogin} onClick={startLogin}>
          Log in again
        </button>
      )}
      {character.login !== undefined && character.login.status !== "expired" && (
        <button
          type="button"
          className={styles.refresh}
          aria-label={`Refresh ${character.name}`}
          title="Refresh skills"
          disabled={character.login.status === "loading"}
          onClick={() => refresh(character.id)}
        >
          ↻
        </button>
      )}
      {character.login !== undefined && (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Log out ${character.name}`}
          title="Log out"
          onClick={() => remove(character.id)}
        >
          ×
        </button>
      )}
    </li>
  );

  return (
    <>
      <button type="button" className={styles.skills} popoverTarget={id}>
        <span className={styles.label}>Skills</span>
        <span className={styles.shown}>{shown?.name}</span>
        {(shown?.login?.status === "expired" || shown?.login?.status === "failed") && (
          <span className={styles.warning} title={warnings[shown.login.status]}>
            ⚠
          </span>
        )}
      </button>
      <dialog
        ref={card}
        id={id}
        popover="auto"
        className={styles.card}
        aria-label="Skills"
        onToggle={(event) => {
          if (event.newState === "closed") setError(undefined);
        }}
      >
        {error !== undefined && <p className={styles.error}>{error}</p>}
        {own.length > 0 && (
          <>
            <h2 className={styles.group}>Your characters</h2>
            <ul className={styles.list}>{own.map(row)}</ul>
            {startLogin && (
              <button type="button" className={styles.add} onClick={startLogin}>
                + Add character
              </button>
            )}
            <hr className={styles.rule} />
          </>
        )}
        <h2 className={styles.group}>Generic</h2>
        <ul className={styles.list}>{generic.map(row)}</ul>
        {own.length === 0 && startLogin && (
          <>
            <hr className={styles.rule} />
            <p className={styles.intro}>
              <strong>Fly with your own skills</strong>
              Log in with EVE Online. We only read your skills and skill queue. Everything stays in your browser.
            </p>
            <button type="button" className={styles.sso} onClick={startLogin}>
              Log in with EVE Online
            </button>
          </>
        )}
      </dialog>
      <span className={styles.separator} />
    </>
  );
}

function Status({ login }: { login: EsiCharacter }) {
  switch (login.status) {
    case "loading":
      return "Loading skills…";
    case "expired":
    case "failed":
      return <span className={styles.expired}>{warnings[login.status]}</span>;
    case "ready":
      return login.updated === undefined ? "No skills yet" : `Skills from ${ago(login.updated)}`;
  }
}

function ago(time: number): string {
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ago`;
  return `${Math.floor(minutes / (24 * 60))} d ago`;
}
