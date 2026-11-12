import { EveShipFitProvider, ImagesProvider, TextsProvider, useHasFit } from "@eveshipfit/react-hooks";
import type { Images } from "@eveshipfit/images";
import { Dialog, FittingWindow, FittingWindowLoading, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import styles from "./App.module.css";
import { linkInUrl, type Data } from "./data";
import type { Layout } from "./layout";
import { keepFit } from "./login";
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
  if (data === null) {
    return <p className={styles.message}>EVEShip.fit could not load. Please reload the page.</p>;
  }

  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;
  const placeholder = layout.stacked
    ? "To start, right-click a hull below and pick Simulate Ship."
    : "To start, drag a hull here from the left,\nor right-click it and pick Simulate Ship.";

  return (
    <EveShipFitProvider
      engine={data.engine}
      fit={data.fit}
      localFits={data.localFits}
      characters={data.characters}
      character={data.character}
      beforeLogin={() => {
        if (data.fit.hasFit) keepFit(data.fit.getSnapshot().fit);
      }}
      zkillboard={zkillboard}
    >
      <ImagesProvider images={data.images}>
        <TextsProvider texts={data.texts}>
          {skills !== null && createPortal(<Skills loginError={data.login.error} />, skills)}
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
                  <ItemBrowser pasteToOpen />
                </div>
                <StackedStatistics style={panelScale} />
              </div>
            </>
          ) : (
            <div className={`${styles.panel} ${styles.window}`} style={scale}>
              <FittingWindow
                browser={<ItemBrowser pasteToOpen />}
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

/** The empty fitting window while the data loads. */
export function FittingLoading({ images, layout }: { images: Images; layout: Layout }) {
  const scale = { "--esf-scale": layout.scale } as CSSProperties;
  const panelScale = { "--esf-scale": layout.panelScale } as CSSProperties;
  const linked = linkInUrl(new URL(location.href)) !== undefined;

  return (
    <ImagesProvider images={images}>
      <div className={`${styles.panel} ${styles.window}`} style={scale}>
        <FittingWindowLoading text="Loading ships…" browser={!layout.stacked} statistics={!layout.stacked && linked} />
      </div>
      {layout.stacked && (
        <div className={styles.panels}>
          <div className={`${styles.panel} ${styles.browser} ${styles.loadingBrowser}`} style={panelScale} />
        </div>
      )}
    </ImagesProvider>
  );
}

function StackedStatistics({ style }: { style: CSSProperties }) {
  if (!useHasFit()) return null;
  return (
    <div className={styles.panel} style={style}>
      <ShipStatistics />
    </div>
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
