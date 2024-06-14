"use client";
import clsx from "clsx";
import React from "react";

import {
  CharacterSelection,
  FitButtonBar,
  HardwareListing,
  HullListing,
  ModalDialogAnchor,
  ShipFitExtended,
  ShipStatistics,
} from "@eveshipfit/react";
import { ESF_DATA_VERSION } from "@eveshipfit/data";

import { Banner } from "@/components/Banner";
import { LocationHash } from "@/components/LocationHash";
import { Debug } from "@/components/Debug";

import styles from "./page.module.css";

declare global {
  interface Window {
    esf_debug: () => void;
  }
}

export const PageMain = () => {
  const [selection, setSelection] = React.useState<"hulls" | "hardware">("hulls");
  const [debug, setDebug] = React.useState(false);

  React.useEffect(() => {
    window.esf_debug = () => setDebug((prev) => !prev);
  }, []);

  return (
    <>
      <LocationHash />
      <Banner />
      <div className={styles.content}>
        <ModalDialogAnchor />
        <div className={styles.selection}>
          <div className={styles.selectionHeader}>
            <div onClick={() => setSelection("hulls")} className={clsx({ [styles.selected]: selection == "hulls" })}>
              Hull & Fits
            </div>
            <div
              onClick={() => setSelection("hardware")}
              className={clsx({ [styles.selected]: selection == "hardware" })}
            >
              Hardware
            </div>
          </div>
          <div className={clsx(styles.selectionContent, { [styles.collapsed]: selection != "hulls" })}>
            <HullListing />
          </div>
          <div className={clsx(styles.selectionContent, { [styles.collapsed]: selection != "hardware" })}>
            <HardwareListing />
          </div>
          <FitButtonBar />
        </div>
        <div className={styles.fit}>
          <ShipFitExtended />
        </div>
        <div className={styles.statistics}>
          <CharacterSelection />
          <ShipStatistics />
        </div>
        <div className={styles.version}>
          v{process.env.APP_VERSION} / v{ESF_DATA_VERSION}
        </div>
      </div>
      <div className={styles.footer}>
        © 2014 CCP hf. All rights reserved. &quot;EVE&quot;, &quot;EVE Online&quot;, &quot;CCP&quot;, and all related
        logos and images are trademarks or registered trademarks of CCP hf.
        <br />
        Kindly hosted by <a href="https://cloudflare.com">Cloudflare</a>.
      </div>
      {debug && <Debug />}
    </>
  );
};
