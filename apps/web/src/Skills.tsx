import { useCharacters, type CharacterChoice, type EsiCharacter } from "@eveshipfit/react-hooks";
import { useEffect, useId, useRef, useState } from "react";

import { keepCanSave, keepCharacter, keptCanSave } from "./character";
import { CloseIcon, RefreshIcon } from "./icons";
import styles from "./Skills.module.css";

const descriptions: Record<string, string> = {
  "All L5": "Every skill at level V",
  "All L0": "No skills at all",
};

const accessLevels = [
  { canSave: false, title: "View only", detail: "Uses your skills and fittings." },
  { canSave: true, title: "View and save fits", detail: "Fits you save show up in game." },
];

const warnings = {
  expired: "Login expired",
  failed: "Could not load skills",
};

/** The button to pick which character flies the fit, and the card it pops up. */
export function Skills({ loginError }: { loginError?: string }) {
  const id = useId();
  const card = useRef<HTMLDialogElement>(null);
  const { characters, current, select, login, refresh, remove } = useCharacters();
  const shown = characters.find((character) => character.id === current);
  const own = characters.filter((character) => character.login !== undefined);
  const generic = characters.filter((character) => character.login === undefined);

  const [error, setError] = useState(loginError);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => keepCharacter(current), [current]);

  useEffect(() => {
    if (loginError !== undefined) card.current?.showPopover();
  }, [loginError]);

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
          {character.login === undefined ? descriptions[character.name] : <Status login={character.login} now={now} />}
        </small>
      </button>
      {character.id === current && <span className={styles.check}>✓</span>}
      {character.login?.status === "expired" && login && (
        <button type="button" className={styles.relogin} onClick={() => login(character.login?.canWriteFits)}>
          Log in again
        </button>
      )}
      {character.login !== undefined &&
        character.login.status !== "expired" &&
        !character.login.canWriteFits &&
        login && (
          <button type="button" className={styles.allow} onClick={() => login(true)}>
            Allow saving
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
          <RefreshIcon />
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
          <CloseIcon />
        </button>
      )}
    </li>
  );

  return (
    <>
      <button type="button" className={styles.skills} popoverTarget={id}>
        <span className={styles.label}>Character</span>
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
        aria-label="Character"
        onToggle={(event) => {
          setOpen(event.newState === "open");
          setNow(Date.now());
          if (event.newState === "closed") setError(undefined);
        }}
      >
        {error !== undefined && <p className={styles.error}>{error}</p>}
        {own.length > 0 && (
          <>
            <h2 className={styles.group}>Your characters</h2>
            <ul className={styles.list}>{own.map(row)}</ul>
            {login && <LoginButton kind={styles.add} label="+ Add character" onLogin={login} />}
            <hr className={styles.rule} />
          </>
        )}
        <h2 className={styles.group}>Generic</h2>
        <ul className={styles.list}>{generic.map(row)}</ul>
        {own.length === 0 && login && (
          <>
            <hr className={styles.rule} />
            <p className={styles.intro}>
              <strong>Use your own skills and fittings</strong>
              Log in with EVE Online. Only your skills and fittings are used. Everything stays in your browser.
            </p>
            <LoginButton kind={styles.sso} label="Log in with EVE Online" onLogin={login} />
          </>
        )}
      </dialog>
      <span className={styles.separator} />
    </>
  );
}

function LoginButton({
  kind,
  label,
  onLogin,
}: {
  kind: string | undefined;
  label: string;
  onLogin: (canSave: boolean) => void;
}) {
  const [canSave, setCanSave] = useState(keptCanSave);
  const [open, setOpen] = useState(false);
  const shown = accessLevels.find((level) => level.canSave === canSave);

  return (
    <>
      <div className={styles.split}>
        <button type="button" className={`${kind} ${styles.splitMain}`} onClick={() => onLogin(canSave)}>
          {label}
          <small className={styles.access}>{shown?.title}</small>
        </button>
        <button
          type="button"
          className={`${kind} ${styles.splitArrow}`}
          aria-label="What to allow"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && (
        <div className={styles.levels}>
          {accessLevels.map((level) => (
            <button
              key={level.title}
              type="button"
              className={styles.level}
              onClick={() => {
                setCanSave(level.canSave);
                keepCanSave(level.canSave);
                setOpen(false);
              }}
            >
              <span className={styles.levelCheck}>{level.canSave === canSave && "✓"}</span>
              <span>
                {level.title}
                <small className={styles.detail}>{level.detail}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function Status({ login, now }: { login: EsiCharacter; now: number }) {
  switch (login.status) {
    case "loading":
      return "Loading skills…";
    case "expired":
    case "failed":
      return <span className={styles.expired}>{warnings[login.status]}</span>;
    case "ready": {
      const updated = login.updated === undefined ? "No skills yet" : `Updated ${ago(now - login.updated)}`;
      return `${updated} · ${login.canWriteFits ? "View and save fits" : "View only"}`;
    }
  }
}

function ago(elapsed: number): string {
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${Math.floor(seconds / 10) * 10} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ago`;
  return `${Math.floor(minutes / (24 * 60))} d ago`;
}
