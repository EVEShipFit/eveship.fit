import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { FittingWindow, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { use, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import styles from "./App.module.css";
import type { Data } from "./data";
import type { Layout } from "./layout";
import { Skills } from "./Skills";

const zkillboard = new ZKillboard();

export interface FittingProps {
  data: Promise<Data | null>;
  layout: Layout;
  /** Where to show the skills dropdown. */
  skills: HTMLElement | null;
}

/** The fitting window of the linked fit or an empty Rifter, with its item browser and statistics. */
export function Fitting({ data, layout, skills }: FittingProps) {
  const loaded = use(data);
  if (loaded === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;

  return (
    <EveShipFitProvider
      engine={loaded.engine}
      fit={loaded.fit}
      localFits={loaded.localFits}
      characters={loaded.characters}
      character={loaded.character}
      zkillboard={zkillboard}
    >
      <ImagesProvider images={loaded.images}>
        <TextsProvider texts={loaded.texts}>
          {skills !== null && createPortal(<Skills loginError={loaded.login.error} />, skills)}
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
