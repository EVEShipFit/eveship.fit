import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { Dialog, FittingWindow, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import styles from "./App.module.css";
import type { Data } from "./data";
import type { Layout } from "./layout";
import { Skills } from "./Skills";

const zkillboard = new ZKillboard();

export interface FittingProps {
  data: Data | null;
  layout: Layout;
  /** Where to show the skills dropdown. */
  skills: HTMLElement | null;
}

/** The fitting window of the linked fit or an empty Rifter, with its item browser and statistics. */
export function Fitting({ data, layout, skills }: FittingProps) {
  if (data === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;

  return (
    <EveShipFitProvider
      engine={data.engine}
      fit={data.fit}
      localFits={data.localFits}
      characters={data.characters}
      character={data.character}
      zkillboard={zkillboard}
    >
      <ImagesProvider images={data.images}>
        <TextsProvider texts={data.texts}>
          {skills !== null && createPortal(<Skills loginError={data.login.error} />, skills)}
          {data.linkError !== undefined && <LinkError error={data.linkError} />}
          {layout.stacked ? (
            <>
              <div className={`${styles.panel} ${styles.window}`} style={scale}>
                <FittingWindow />
              </div>
              <div className={styles.panels}>
                <div className={`${styles.panel} ${styles.browser}`} style={panelScale}>
                  <ItemBrowser />
                </div>
                <div className={styles.panel} style={panelScale}>
                  <ShipStatistics />
                </div>
              </div>
            </>
          ) : (
            <div className={`${styles.panel} ${styles.window}`} style={scale}>
              <FittingWindow browser={<ItemBrowser />} statistics={<ShipStatistics />} />
            </div>
          )}
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}

function LinkError({ error }: { error: string }) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} title="Broken Fit Link" onClose={() => setOpen(false)}>
      <div className={styles.linkError}>
        <p>This link has a fit that EVEShip.fit could not load.</p>
        <p className={styles.reason}>{error}</p>
      </div>
    </Dialog>
  );
}
