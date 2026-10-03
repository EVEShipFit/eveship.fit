# @eveshipfit/esi

A small client for [ESI](https://developers.eveonline.com/docs/services/esi/overview/), EVE Online's API.

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/esi
```

## Usage

```ts
import { Esi } from "@eveshipfit/esi";

const esi = new Esi({ userAgent: "MyApp/1.0 (me@example.com; +https://example.com)" });

const killmail = await esi.killmail(123456789, "0123abcd");
const prices = await esi.marketPrices();
prices.get(587)?.average_price; // a Rifter
```

`Sso` logs in a character through EVE's login, with PKCE; its tokens go to `characterSkills` and
`characterSkillQueue`:

```ts
import { Sso } from "@eveshipfit/esi";

const sso = new Sso({ clientId: "…", redirectUri: "https://example.com/" });

const { url, state, verifier } = await sso.authorize(["esi-skills.read_skills.v1"]);
// Send the user to `url`; EVE sends them back with `code` and `state`.
const login = await sso.login(code, verifier);
const skills = await esi.characterSkills(login.characterId, login.accessToken);
const later = await sso.refresh(login.refreshToken);
await sso.revoke(later.refreshToken);
```

A failed login throws an `SsoError` with the OAuth `error`; `invalid_grant` means the refresh token is no longer valid.

Every request goes to an unversioned route with a fixed `X-Compatibility-Date`. The user agent goes in both `User-Agent`
and `X-User-Agent`, as Chromium drops the first. HTTP caching is left to `fetch`;
`marketPrices` also keeps the parsed prices until ESI says they expire.

On a 420 or 429, every request waits as long as ESI asks, and tries again up to twice. An error ESI answers with throws
an `EsiError` with the `status`.

## License

MIT
