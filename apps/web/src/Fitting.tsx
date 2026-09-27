import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { FittingWindow, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { use, type CSSProperties } from "react";

import styles from "./App.module.css";
import type { Data } from "./data";
import type { Layout } from "./layout";

export interface FittingProps {
  data: Promise<Data | null>;
  layout: Layout;
}

/** The fitting window of an empty Rifter, with its item browser and statistics. */
export function Fitting({ data, layout }: FittingProps) {
  const loaded = use(data);
  if (loaded === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;

  return (
    <EveShipFitProvider engine={loaded.engine}>
      <ImagesProvider images={loaded.images}>
        <TextsProvider texts={loaded.texts}>
          {layout.stacked ? (
            <>
              <div className={styles.panel} style={scale}>
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
            <div className={styles.panel} style={scale}>
              <FittingWindow browser={<ItemBrowser />} statistics={<ShipStatistics />} />
            </div>
          )}
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}
