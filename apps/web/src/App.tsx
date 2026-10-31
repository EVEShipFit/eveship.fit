import { useState } from "react";

import styles from "./App.module.css";
import type { Data } from "./data";
import { Fitting } from "./Fitting";
import { DiscordIcon, GitHubIcon } from "./icons";
import { keepUiScale, keptUiScale, UI_SCALES, useLayout } from "./layout";
import { Support } from "./Support";

const PREVIEW = location.hostname === "next.eveship.fit";

/** `data` is undefined while it loads, and null when it failed. */
export function App({ data }: { data: Data | null | undefined }) {
  const [main, setMain] = useState<HTMLElement | null>(null);
  const [footer, setFooter] = useState<HTMLElement | null>(null);
  const [skills, setSkills] = useState<HTMLElement | null>(null);
  const [uiScale, setUiScale] = useState(keptUiScale);
  const layout = useLayout(main, footer, uiScale);

  return (
    <>
      {PREVIEW && (
        <aside className={styles.preview} aria-label="Preview site">
          <span aria-hidden="true">⚠ </span>
          <strong>Preview site.</strong> A test version of eveship.fit. Fits and characters are not shared across.{" "}
          <a
            href="https://eveship.fit/"
            onClick={(event) => {
              event.currentTarget.href = `https://eveship.fit${location.pathname}${location.search}${location.hash}`;
            }}
          >
            Go to eveship.fit →
          </a>
        </aside>
      )}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <a className={styles.brand} href="/">
            EVEShip.fit
          </a>
          <span className={styles.dash}> - </span>
          <span className={styles.tagline}>View, Create, and Share your EVE Online ship fits online</span>
        </h1>
        <div className={styles.actions}>
          <div ref={setSkills} className={styles.skills} />
          <nav className={styles.links} aria-label="Community">
            <a className={styles.link} href="https://github.com/EVEShipFit" target="_blank">
              <GitHubIcon />
              <span className={styles.text}>GitHub</span>
            </a>
            <a className={styles.link} href="https://discord.gg/S5V5BkvNf7" target="_blank">
              <DiscordIcon />
              <span className={styles.text}>Discord</span>
            </a>
            <Support />
          </nav>
        </div>
      </header>
      <main ref={setMain} className={styles.main}>
        <div className={styles.stage}>
          {data === undefined ? (
            <p className={styles.message}>Loading ships…</p>
          ) : (
            <Fitting data={data} layout={layout} skills={skills} />
          )}
        </div>
        <footer ref={setFooter} className={styles.footer}>
          <p>
            <span>
              EVEShip.fit {import.meta.env.EVESHIPFIT_VERSION}
              <DataVersion data={data} />
            </span>
            {" · "}
            <label>
              UI scale{" "}
              <select
                className={styles.scale}
                value={uiScale}
                onChange={(event) => {
                  const scale = Number(event.target.value);
                  setUiScale(scale);
                  keepUiScale(scale);
                }}
              >
                {UI_SCALES.map((scale) => (
                  <option key={scale} value={scale}>
                    {Math.round(scale * 100)}%
                  </option>
                ))}
              </select>
            </label>
          </p>
          <p>
            © 2014 CCP hf. All rights reserved. &quot;EVE&quot;, &quot;EVE Online&quot;, &quot;CCP&quot;, and all
            related logos and images are trademarks or registered trademarks of CCP hf.
          </p>
          <p>
            Kindly hosted by <a href="https://cloudflare.com">Cloudflare</a>.
          </p>
        </footer>
      </main>
    </>
  );
}

function DataVersion({ data }: { data: Data | null | undefined }) {
  const releaseDate = data?.sde.releaseDate;
  if (releaseDate === undefined) return null;

  return <> · EVE data from {releaseDate.toISOString().slice(0, 10)}</>;
}
