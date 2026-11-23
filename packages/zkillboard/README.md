# @eveshipfit/zkillboard

A small client for [zKillboard](https://zkillboard.com)'s API.

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/zkillboard
```

## Usage

```ts
import { ZKillboard } from "@eveshipfit/zkillboard";

const zkillboard = new ZKillboard();

const prices = await zkillboard.prices();
prices.get(35834); // a Keepstar, in ISK
```

`prices()` gives zKillboard's price of every type it knows, by type ID. They are yesterday's prices (UTC), as today's
are still filling in. They are fetched once, and again when the day changes. A type zKillboard has no price for is
left out.

## License

MIT
