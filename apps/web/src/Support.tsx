import { useId, useState } from "react";

import { HeartIcon } from "./icons";
import styles from "./Support.module.css";

const CORPORATION = "EVEShip.fit";

/** The Support button, and the ways to donate it pops up. */
export function Support() {
  const id = useId();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(CORPORATION).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <button type="button" className={styles.button} popoverTarget={id}>
        <HeartIcon />
        Support
      </button>
      <dialog id={id} popover="auto" className={styles.card} aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`} className={styles.title}>
          Support EVEShip.fit
        </h2>
        <p className={styles.intro}>EVEShip.fit is free and open source. If it helps you, any support is welcome.</p>
        <div className={styles.options}>
          <section className={styles.option}>
            <h3 className={styles.kind}>Real money</h3>
            <p>Once or monthly, through GitHub.</p>
            <a className={styles.action} href="https://github.com/sponsors/EVEShipFit" target="_blank">
              <HeartIcon />
              Sponsor on GitHub
            </a>
          </section>
          <section className={styles.option}>
            <h3 className={styles.kind}>In-game ISK</h3>
            <p>
              Give ISK to the corporation{" "}
              <a href="https://evewho.com/corporation/98753333" target="_blank">
                {CORPORATION}
              </a>
              .
            </p>
            <button type="button" className={styles.action} onClick={copy}>
              {copied ? "Copied!" : "Copy corporation name"}
            </button>
          </section>
        </div>
        <p className={styles.thanks}>Thank you! o7</p>
      </dialog>
    </>
  );
}
