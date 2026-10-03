import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";

import { Sso, SsoError } from "../src/index.js";

const sso = () => new Sso({ clientId: "client", redirectUri: "https://example.com/" });

/** An access token as EVE gives it; only the payload matters here. */
function accessToken(payload: object): string {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

let fetch: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  fetch = vi.fn<typeof globalThis.fetch>();
  vi.stubGlobal("fetch", fetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("the login URL asks for the scopes, with a PKCE challenge of the verifier", async () => {
  const { url, state, verifier } = await sso().authorize([
    "esi-skills.read_skills.v1",
    "esi-skills.read_skillqueue.v1",
  ]);

  const query = new URL(url).searchParams;
  expect(url).toMatch(/^https:\/\/login\.eveonline\.com\/v2\/oauth\/authorize\?/);
  expect(Object.fromEntries(query)).toMatchObject({
    response_type: "code",
    client_id: "client",
    redirect_uri: "https://example.com/",
    scope: "esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1",
    code_challenge_method: "S256",
    state,
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  expect(query.get("code_challenge")).toBe(Buffer.from(digest).toString("base64url"));
});

test("a login trades the code for the character and its tokens", async () => {
  const token = accessToken({ sub: "CHARACTER:EVE:90000001", name: "Pilot Ünïcode" });
  fetch.mockResolvedValue(Response.json({ access_token: token, refresh_token: "refresh" }));

  const login = await sso().login("code", "verifier");

  expect(login).toEqual({ characterId: 90000001, name: "Pilot Ünïcode", accessToken: token, refreshToken: "refresh" });
  const [url, init] = fetch.mock.calls[0]!;
  expect(url).toBe("https://login.eveonline.com/v2/oauth/token");
  expect(Object.fromEntries(init!.body as URLSearchParams)).toEqual({
    grant_type: "authorization_code",
    code: "code",
    code_verifier: "verifier",
    client_id: "client",
  });
});

test("a refresh token EVE no longer accepts throws its OAuth error", async () => {
  fetch.mockResolvedValue(Response.json({ error: "invalid_grant", error_description: "Invalid" }, { status: 400 }));

  const error = await sso()
    .refresh("refresh")
    .catch((caught: unknown) => caught);

  expect(error).toBeInstanceOf(SsoError);
  expect(error).toMatchObject({ status: 400, error: "invalid_grant", message: "EVE SSO: Invalid (HTTP 400)" });
});
