import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { Esi, Sso } from "@eveshipfit/esi";
import { createEngine, type Engine, type Fit, type FitStore } from "@eveshipfit/fitting";
import { loadImages, type Images } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import textsUrl from "@eveshipfit/sde/dist/texts.dat?url";
import { EsiCharacters, LocalFits } from "@eveshipfit/react-hooks";
import { loadSde, loadTexts, type Sde, type Texts } from "@eveshipfit/sde-loader";

import { keptCharacter } from "./character";
import { finishLogin, type Login } from "./login";
import { moveV1Fits } from "./v1-fits";

const RIFTER = 587;

export interface Data {
  engine: Engine;
  sde: Sde;
  images: Images;
  texts: Texts;
  fit: FitStore;
  localFits: LocalFits;
  characters?: EsiCharacters;
  /** Who flies the fit at first, as `useCharacters` lists it. */
  character?: string;
  login: Login;
  /** Why the fit in the link could not load. */
  linkError?: string;
}

/** Everything the fitting window needs; null when any of it failed to load. */
export async function loadData(): Promise<Data | null> {
  try {
    const esi = new Esi({
      userAgent: `EVEShip.fit/${import.meta.env.EVESHIPFIT_VERSION} (info@eveship.fit; +https://eveship.fit)`,
    });
    const sdeLoad = loadSde({ url: sdeUrl });
    const engineLoad = sdeLoad.then((loaded) => createEngine(loaded, { wasm: wasmUrl, esi }));
    const localFits = new LocalFits();
    moveV1Fits(localFits).catch(console.error);
    const characters = loadCharacters(esi, engineLoad, localFits);
    const login = finishLogin(characters).then((result) => {
      characters?.loadAll();
      return result;
    });
    const [sde, engine, images, texts] = await Promise.all([
      sdeLoad,
      engineLoad,
      // vite.config.ts serves the images at /images/.
      loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
      loadTexts({ url: textsUrl }),
    ]);
    const [linked, loggedIn] = await Promise.all([loadLinkedFit(engine), login]);
    const fit = linked.fit ?? keptFit(engine, loggedIn.fit) ?? engine.createFit({ ship: RIFTER });
    keepInUrl(engine, fit, linked.error !== undefined);
    const character = loggedIn.character ?? keptCharacter(characters);
    return {
      engine,
      sde,
      images,
      texts,
      fit,
      localFits,
      characters,
      character,
      login: loggedIn,
      linkError: linked.error,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** Undefined without a client ID, or where the browser blocks storage. */
function loadCharacters(esi: Esi, engine: Promise<Engine>, localFits: LocalFits): EsiCharacters | undefined {
  const clientId = import.meta.env.VITE_ESI_CLIENT_ID;
  if (!clientId) return undefined;
  try {
    return new EsiCharacters({
      esi,
      sso: new Sso({ clientId, redirectUri: new URL("/", location.href).href }),
      engine,
      localFits,
    });
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

async function loadLinkedFit(engine: Engine): Promise<{ fit?: FitStore; error?: string }> {
  const url = new URL(location.href);
  const link = url.searchParams.get("fit");
  if (link === null) return {};

  try {
    return { fit: engine.createFit(await engine.loadLink(link)) };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/** Writes the fit into the URL whenever it changes; `keepLink` leaves the link as is until then. */
function keepInUrl(engine: Engine, store: FitStore, keepLink: boolean) {
  let fit = keepLink ? store.getSnapshot().fit : undefined;
  const update = () => {
    const snapshot = store.getSnapshot();
    if (snapshot.fit === fit) return;
    fit = snapshot.fit;

    const url = new URL(location.href);
    url.searchParams.delete("fit");
    try {
      url.search += `${url.search === "" ? "" : "&"}fit=${engine.saveLink(fit)}`;
    } catch (error) {
      console.error(error);
    }
    history.replaceState(history.state, "", url);
  };
  update();
  store.subscribe(update);
}
