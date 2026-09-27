import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { createEngine, type Engine } from "@eveshipfit/fitting";
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
}

/** Everything the fitting window needs; null when any of it failed to load. */
export async function loadData(): Promise<Data | null> {
  try {
    const sdeLoad = loadSde({ url: sdeUrl });
    const [sde, engine, images, texts] = await Promise.all([
      sdeLoad,
      sdeLoad.then((loaded) => createEngine(loaded, { wasm: wasmUrl })),
      // vite.config.ts serves the images at /images/.
      loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
      loadTexts({ url: textsUrl }),
    ]);
    return { engine, sde, images, texts };
  } catch (error) {
    console.error(error);
    return null;
  }
}
