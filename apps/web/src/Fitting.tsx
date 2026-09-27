import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { FittingWindow, ShipStatistics } from "@eveshipfit/ui-ingame";
import { use, type CSSProperties } from "react";

import styles from "./App.module.css";
import type { Data } from "./data";
import type { Layout } from "./layout";

export interface FittingProps {
  data: Promise<Data | null>;
  layout: Layout;
}

/** The fitting window of an empty Rifter, with its statistics. */
export function Fitting({ data, layout }: FittingProps) {
  const loaded = use(data);
  if (loaded === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;

  return (
    <EveShipFitProvider engine={loaded.engine}>
      <ImagesProvider images={loaded.images}>
        <TextsProvider texts={loaded.texts}>
          {layout.stacked ? (
            <>
              <div className={styles.panel} style={scale}>
                <FittingWindow />
              </div>
              <div className={styles.panel}>
                <ShipStatistics />
              </div>
            </>
          ) : (
            <div className={styles.panel} style={scale}>
              <FittingWindow statistics={<ShipStatistics />} />
            </div>
          )}
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}
