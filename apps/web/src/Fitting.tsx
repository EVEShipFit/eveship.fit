import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { Dialog, FittingWindow, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { useEffect, useState, type CSSProperties } from "react";
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

/** The fitting window, with its item browser and statistics. */
export function Fitting({ data, layout, skills }: FittingProps) {
  const empty = useEmpty(data);
  if (data === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;
  const placeholder = empty ? `To start, select a hull ${layout.stacked ? "below" : "on the left"}.` : undefined;

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
          {skills !== null && createPortal(<Skills loginError={data.login.error} empty={empty} />, skills)}
          {data.linkError !== undefined && (
            <div className={styles.contents} style={scale}>
              <LinkError error={data.linkError} />
            </div>
          )}
          {layout.stacked ? (
            <>
              <div className={`${styles.panel} ${styles.window}`} style={scale}>
                <FittingWindow placeholder={placeholder} />
              </div>
              <div className={styles.panels}>
                <div className={`${styles.panel} ${styles.browser}`} style={panelScale}>
                  <ItemBrowser noHullSelected={empty} />
                </div>
                {!empty && (
                  <div className={styles.panel} style={panelScale}>
                    <ShipStatistics />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={`${styles.panel} ${styles.window}`} style={scale}>
              <FittingWindow
                browser={<ItemBrowser noHullSelected={empty} />}
                statistics={<ShipStatistics />}
                placeholder={placeholder}
              />
            </div>
          )}
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}

/** Whether the fit is still the stand-in; the first change to it picks a hull. */
function useEmpty(data: Data | null): boolean {
  const [empty, setEmpty] = useState(data?.empty ?? false);

  useEffect(() => {
    if (!empty || data === null) return;
    const standIn = data.fit.getSnapshot().fit;
    return data.fit.subscribe(() => {
      if (data.fit.getSnapshot().fit === standIn) return;
      setEmpty(false);
      data.fit.clearHistory();
    });
  }, [data, empty]);

  return empty;
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
