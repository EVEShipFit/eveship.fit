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

await zkillboard.price(35834); // a Keepstar, in ISK
```

zKillboard prices what ESI has no market price for, like capital modules and Keepstars. Requests go one at a time, a
second apart, and each type is asked for once.

## License

MIT
