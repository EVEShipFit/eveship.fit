import type { Fit } from "@eveshipfit/fitting";
import type { EsiCharacters } from "@eveshipfit/react-hooks";

const FIT_KEY = "eveshipfit.login-fit";

export interface Login {
  /** The character that just logged in, as `useCharacters` lists it. */
  character?: string;
  error?: string;
  /** The fit open when the login started. */
  fit?: Fit;
}

/** Keeps the fit through the trip to EVE's login. */
export function keepFit(fit: Fit) {
  sessionStorage.setItem(FIT_KEY, JSON.stringify(fit));
}

/** Finishes the login EVE sent the user back from, if it did. */
export async function finishLogin(characters: EsiCharacters | undefined): Promise<Login> {
  const url = new URL(location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (state === null) return {};

  for (const key of ["code", "state", "error", "error_description"]) url.searchParams.delete(key);
  history.replaceState(history.state, "", url);

  const fit = keptFit();
  if (code === null) return { error: "Logging in was cancelled.", fit };
  if (characters === undefined) return { fit };
  try {
    return { character: String(await characters.finishLogin(code, state)), fit };
  } catch (error) {
    console.error(error);
    return { error: "Logging in failed. Please try again.", fit };
  }
}

function keptFit(): Fit | undefined {
  try {
    const kept = sessionStorage.getItem(FIT_KEY);
    sessionStorage.removeItem(FIT_KEY);
    return kept === null ? undefined : (JSON.parse(kept) as Fit);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
