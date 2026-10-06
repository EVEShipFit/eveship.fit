import { EveShipFitProvider, ImagesProvider, TextsProvider } from "@eveshipfit/react-hooks";
import { FittingWindow, ShipStatistics } from "@eveshipfit/ui-ingame";
import { ZKillboard } from "@eveshipfit/zkillboard";
import { StrictMode, Suspense, use, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/noto-sans";
import "@eveshipfit/ui-ingame/theme.css";
import "./og.css";

import { createEsi, loadGame } from "./data";
import styles from "./Og.module.css";

type Loaded = Awaited<ReturnType<typeof loadOg>>;

const PRICE_WAIT = 3_000;

/** zKillboard, keeping the prices it is still asked for. */
class AskedZKillboard extends ZKillboard {
  readonly asked = new Set<Promise<unknown>>();

  override price(typeId: number): Promise<number | undefined> {
    const price = super.price(typeId);
    const asked = price.catch(() => undefined).finally(() => this.asked.delete(asked));
    this.asked.add(asked);
    return price;
  }
}

const zkillboard = new AskedZKillboard();

/** The linked fit, flown with All L5; null when it could not load. */
async function loadOg() {
  try {
    const esi = createEsi();
    const prices = esi.marketPrices().catch(console.error);
    const game = loadGame(esi);
    const [engine, images, texts] = await Promise.all([game.engine, game.images, game.texts]);
    const link = new URL(location.href).searchParams.get("fit");
    if (link === null) throw new Error("The link has no fit");
    const fit = engine.createFit(await engine.loadLink(link));
    return { engine, images, texts, fit, prices };
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** The OG image of the linked fit: its fitting window and statistics, at 1200 by 630. */
function Og({ data }: { data: Promise<Loaded> }) {
  const loaded = use(data);

  useEffect(() => {
    if (loaded === null) {
      void ready("error");
    } else {
      void Promise.race([priced(loaded.prices), sleep(PRICE_WAIT)]).then(() => ready("true"));
    }
  }, [loaded]);

  if (loaded === null) return <p className={styles.broken}>This fit could not load.</p>;

  return (
    <EveShipFitProvider engine={loaded.engine} fit={loaded.fit} zkillboard={zkillboard}>
      <ImagesProvider images={loaded.images}>
        <TextsProvider texts={loaded.texts}>
          <div className={styles.window}>
            <FittingWindow statistics={<ShipStatistics />} preview />
          </div>
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}

/** Once ESI's prices are in, and then every price zKillboard is asked for. */
async function priced(prices: Promise<unknown>) {
  await prices;
  do {
    await nextFrame();
    await nextFrame();
    await Promise.all(zkillboard.asked);
  } while (zkillboard.asked.size > 0);
}

/** Tells the screenshotter the image is done, once its fonts and images are in. */
async function ready(state: "true" | "error") {
  await document.fonts.ready;
  const shown = [...document.images].filter((image) => image.checkVisibility());
  await Promise.all(shown.map((image) => image.decode().catch(() => undefined)));
  document.body.dataset.ready = state;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

const data = loadOg();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <span className={styles.brand}>EVEShip.fit</span>
    <Suspense>
      <Og data={data} />
    </Suspense>
  </StrictMode>,
);
