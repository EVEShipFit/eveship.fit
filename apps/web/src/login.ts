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
  if (code === null || state === null) return {};

  url.searchParams.delete("code");
  url.searchParams.delete("state");
  history.replaceState(history.state, "", url);

  const kept = sessionStorage.getItem(FIT_KEY);
  sessionStorage.removeItem(FIT_KEY);
  const fit = kept === null ? undefined : (JSON.parse(kept) as Fit);

  if (characters === undefined) return { fit };
  try {
    return { character: String(await characters.finishLogin(code, state)), fit };
  } catch (error) {
    console.error(error);
    return { error: "Logging in failed. Please try again.", fit };
  }
}
