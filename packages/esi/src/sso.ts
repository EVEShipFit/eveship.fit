const baseUrl = "https://login.eveonline.com/v2/oauth";
const timeout = 10_000;

export interface SsoOptions {
  /** The client ID of the application on developers.eveonline.com. */
  clientId: string;
  /** Where EVE sends the user back to; the application's callback URL. */
  redirectUri: string;
}

/** Where to send the user to log in, and what to keep until they are back. */
export interface SsoAuthorization {
  url: string;
  state: string;
  verifier: string;
}

/** A logged-in character, with its tokens. */
export interface SsoLogin {
  characterId: number;
  name: string;
  /** The scopes the character agreed to. */
  scopes: readonly string[];
  accessToken: string;
  refreshToken: string;
}

/** EVE's login answered with an error. */
export class SsoError extends Error {
  readonly status: number;
  /** The OAuth error, like `invalid_grant`. */
  readonly error: string | undefined;

  constructor(status: number, error: string | undefined, description: string | undefined) {
    super(`EVE SSO: ${description ?? error ?? "request failed"} (HTTP ${status})`);
    this.name = "SsoError";
    this.status = status;
    this.error = error;
  }
}

/** EVE's login, with PKCE. */
export class Sso {
  readonly #clientId: string;
  readonly #redirectUri: string;

  constructor(options: SsoOptions) {
    this.#clientId = options.clientId;
    this.#redirectUri = options.redirectUri;
  }

  async authorize(scopes: readonly string[]): Promise<SsoAuthorization> {
    const state = randomString(16);
    const verifier = randomString(32);
    const challenge = base64url(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))),
    );
    const query = new URLSearchParams({
      response_type: "code",
      redirect_uri: this.#redirectUri,
      client_id: this.#clientId,
      scope: scopes.join(" "),
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });
    return { url: `${baseUrl}/authorize?${query}`, state, verifier };
  }

  /** Trades the `code` EVE sent the user back with for tokens. */
  login(code: string, verifier: string): Promise<SsoLogin> {
    return this.#token({ grant_type: "authorization_code", code, code_verifier: verifier });
  }

  refresh(refreshToken: string): Promise<SsoLogin> {
    return this.#token({ grant_type: "refresh_token", refresh_token: refreshToken });
  }

  /** Makes the refresh token, and the login it belongs to, invalid. */
  async revoke(refreshToken: string): Promise<void> {
    const response = await fetch(`${baseUrl}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token_type_hint: "refresh_token", token: refreshToken, client_id: this.#clientId }),
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) throw new SsoError(response.status, undefined, undefined);
  }

  async #token(grant: Record<string, string>): Promise<SsoLogin> {
    const response = await fetch(`${baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...grant, client_id: this.#clientId }),
      signal: AbortSignal.timeout(timeout),
    });
    const body = (await response.json().catch(() => ({}))) as {
      access_token?: string;
      refresh_token?: string;
      error?: string;
      error_description?: string;
    };
    if (!response.ok || body.access_token === undefined || body.refresh_token === undefined) {
      throw new SsoError(response.status, body.error, body.error_description);
    }

    const { sub, name, scp = [] } = decodeJwt(body.access_token);
    const characterId = Number(/^CHARACTER:EVE:(\d+)$/.exec(sub ?? "")?.[1]);
    if (!characterId || name === undefined) throw new SsoError(response.status, undefined, "not a character");
    return {
      characterId,
      name,
      scopes: typeof scp === "string" ? [scp] : scp,
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
    };
  }
}

interface JwtPayload {
  sub?: string;
  name?: string;
  /** A single scope is a string. */
  scp?: string | string[];
}

function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1] ?? "";
  const binary = atob(payload.replaceAll("-", "+").replaceAll("_", "/"));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))) as JwtPayload;
}

function randomString(bytes: number): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
