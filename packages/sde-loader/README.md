# @eveshipfit/sde-loader

Typed lookups into the EVE Online SDE as shipped by [`@eveshipfit/sde`](https://www.npmjs.com/package/@eveshipfit/sde).

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/sde-loader @eveshipfit/sde
```

`@eveshipfit/sde` holds the data files. You can also serve `sde.dat` and `names.dat` from elsewhere; they have to come
from a matching major version.

## Usage

The examples use Vite's `?url` imports to get the URL of a data file.

```ts
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import { loadSde } from "@eveshipfit/sde-loader";

const sde = await loadSde({ url: sdeUrl });

const rifter = sde.type(587);
rifter?.name; // "Rifter"
sde.group(rifter!.groupId)?.name; // "Frigate"
rifter?.attributes.get(sde.attributeId("hiSlots")!); // 3

sde.typeByName("Rifter")?.id; // 587
sde.marketTree(); // the published market, root groups first
sde.shipTree(); // published ships, by group and race
```

`loadSde` and `loadNames` take `{ url }` to fetch the file, or `{ bytes }` if you already have it.

To find a type by its name in any language EVE supports, for example when importing a fit:

```ts
import namesUrl from "@eveshipfit/sde/dist/names.dat?url";
import { loadNames } from "@eveshipfit/sde-loader";

const names = await loadNames({ url: namesUrl });
names.typeId("リフター"); // 587
```

## License

MIT
