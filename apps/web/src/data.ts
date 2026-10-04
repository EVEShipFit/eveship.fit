import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { Esi, Sso } from "@eveshipfit/esi";
import { createEngine, type Engine, type Fit, type FitStore } from "@eveshipfit/fitting";
import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import textsUrl from "@eveshipfit/sde/dist/texts.dat?url";
import { EsiCharacters } from "@eveshipfit/react-hooks";
import { loadSde, loadTexts, type Sde, type Texts } from "@eveshipfit/sde-loader";

import { finishLogin, type Login } from "./login";

const RIFTER = 587;

export interface Data {
  engine: Engine;
  sde: Sde;
  images: Images;
  texts: Texts;
  fit: FitStore;
  characters?: EsiCharacters;
  login: Login;
}

/** Everything the fitting window needs; null when any of it failed to load. */
export async function loadData(): Promise<Data | null> {
  try {
    const esi = new Esi({
      userAgent: `EVEShip.fit/${import.meta.env.EVESHIPFIT_VERSION} (info@eveship.fit; +https://eveship.fit)`,
    });
    const characters = loadCharacters(esi);
    const login = finishLogin(characters).then((result) => {
      characters?.loadAll();
      return result;
    });
    const sdeLoad = loadSde({ url: sdeUrl });
    const [sde, engine, images, texts] = await Promise.all([
      sdeLoad,
      sdeLoad.then((loaded) => createEngine(loaded, { wasm: wasmUrl, esi })),
      // vite.config.ts serves the images at /images/.
      loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
      loadTexts({ url: textsUrl }),
    ]);
    const [linked, loggedIn] = await Promise.all([loadLinkedFit(engine), login]);
    const fit = linked ?? keptFit(engine, loggedIn.fit) ?? engine.createFit({ ship: RIFTER });
    keepInUrl(engine, fit);
    return { engine, sde, images, texts, fit, characters, login: loggedIn };
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** Undefined without a client ID, or where the browser blocks storage. */
function loadCharacters(esi: Esi): EsiCharacters | undefined {
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID;
  if (!clientId) return undefined;
  try {
    return new EsiCharacters({ esi, sso: new Sso({ clientId, redirectUri: new URL("/", location.href).href }) });
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function keptFit(engine: Engine, fit: Fit | undefined): FitStore | undefined {
  if (fit === undefined) return undefined;
  try {
    return engine.createFit(fit);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

async function loadLinkedFit(engine: Engine): Promise<FitStore | undefined> {
  const url = new URL(location.href);
  const link = url.searchParams.get("fit");
  if (link === null) return undefined;

  try {
    return engine.createFit(await engine.loadLink(link));
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function keepInUrl(engine: Engine, store: FitStore) {
  let fit: Fit | undefined;
  const update = () => {
    const snapshot = store.getSnapshot();
    if (snapshot.fit === fit) return;
    fit = snapshot.fit;

    const url = new URL(location.href);
    try {
      url.searchParams.set("fit", engine.saveLink(fit));
    } catch (error) {
      console.error(error);
      url.searchParams.delete("fit");
    }
    history.replaceState(history.state, "", url);
  };
  update();
  store.subscribe(update);
}
