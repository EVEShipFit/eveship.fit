import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { Esi } from "@eveshipfit/esi";
import { createEngine, type Engine, type FitStore } from "@eveshipfit/fitting";
import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import textsUrl from "@eveshipfit/sde/dist/texts.dat?url";
import { loadSde, loadTexts, type Sde, type Texts } from "@eveshipfit/sde-loader";

export interface Data {
  engine: Engine;
  sde: Sde;
  images: Images;
  texts: Texts;
  /** The fit of the `fit` link the page opened with. */
  fit?: FitStore;
}

/** Everything the fitting window needs; null when any of it failed to load. */
export async function loadData(): Promise<Data | null> {
  try {
    const esi = new Esi({
      userAgent: `EVEShip.fit/${import.meta.env.EVESHIPFIT_VERSION} (info@eveship.fit; +https://eveship.fit)`,
    });
    const sdeLoad = loadSde({ url: sdeUrl });
    const [sde, engine, images, texts] = await Promise.all([
      sdeLoad,
      sdeLoad.then((loaded) => createEngine(loaded, { wasm: wasmUrl, esi })),
      // vite.config.ts serves the images at /images/.
      loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
      loadTexts({ url: textsUrl }),
    ]);
    return { engine, sde, images, texts, fit: await loadLinkedFit(engine) };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadLinkedFit(engine: Engine): Promise<FitStore | undefined> {
  const url = new URL(location.href);
  const link = url.searchParams.get("fit");
  if (link === null) return undefined;

  url.searchParams.delete("fit");
  history.replaceState(history.state, "", url);

  try {
    return engine.createFit(await engine.loadLink(link));
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
