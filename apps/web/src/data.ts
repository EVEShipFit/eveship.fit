import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { createEngine, type Engine } from "@eveshipfit/fitting";
import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import textsUrl from "@eveshipfit/sde/dist/texts.dat?url";
import { loadSde, loadTexts, type Texts } from "@eveshipfit/sde-loader";

export interface Data {
  engine: Engine;
  images: Images;
  texts: Texts;
}

/** Everything the fitting window needs; null when any of it failed to load. */
export async function loadData(): Promise<Data | null> {
  try {
    const [engine, images, texts] = await Promise.all([
      loadSde({ url: sdeUrl }).then((sde) => createEngine(sde, { wasm: wasmUrl })),
      // vite.config.ts serves the images at /images/.
      loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
      loadTexts({ url: textsUrl }),
    ]);
    return { engine, images, texts };
  } catch (error) {
    console.error(error);
    return null;
  }
}
