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

Every request goes to an unversioned route with a fixed `X-Compatibility-Date`. The user agent goes in both `User-Agent`
and `X-User-Agent`, as Chromium drops the first. HTTP caching is left to `fetch`;
`marketPrices` also keeps the parsed prices until ESI says they expire.

On a 420 or 429, every request waits as long as ESI asks, and tries again up to twice. An error ESI answers with throws
an `EsiError` with the `status`.

## License

MIT
