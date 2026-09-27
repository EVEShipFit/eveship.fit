import { Suspense, use, useState } from "react";

import styles from "./App.module.css";
import type { Data } from "./data";
import { Fitting } from "./Fitting";
import { DiscordIcon, GitHubIcon } from "./icons";
import { useLayout } from "./layout";
import { Support } from "./Support";

export function App({ data }: { data: Promise<Data | null> }) {
  const [main, setMain] = useState<HTMLElement | null>(null);
  const [footer, setFooter] = useState<HTMLElement | null>(null);
  const layout = useLayout(main, footer);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.brand}>EVEShip.fit</span>
          <span className={styles.dash}> - </span>
          <span className={styles.tagline}>View, Create, and Share your EVE Online ship fits online</span>
        </h1>
        <nav className={styles.links} aria-label="Community">
          <a className={styles.link} href="https://github.com/EVEShipFit" target="_blank">
            <GitHubIcon />
            GitHub
          </a>
          <a className={styles.link} href="https://discord.gg/S5V5BkvNf7" target="_blank">
            <DiscordIcon />
            Discord
          </a>
          <Support />
        </nav>
      </header>
      <main ref={setMain} className={styles.main}>
        <div className={styles.stage}>
          <Suspense fallback={<p className={styles.message}>Loading ships…</p>}>
            <Fitting data={data} layout={layout} />
          </Suspense>
        </div>
        <footer ref={setFooter} className={styles.footer}>
          <p>
            EVEShip.fit {import.meta.env.EVESHIPFIT_VERSION}
            <Suspense>
              <DataVersion data={data} />
            </Suspense>
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

const longDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

function DataVersion({ data }: { data: Promise<Data | null> }) {
  const releaseDate = use(data)?.sde.releaseDate;
  if (releaseDate === undefined) return null;

  return <> · EVE data from {longDate.format(releaseDate)}</>;
}
