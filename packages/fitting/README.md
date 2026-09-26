# @eveshipfit/fitting

EVE Online ship fits that recalculate themselves, on top of
[`@eveshipfit/dogma-engine`](https://www.npmjs.com/package/@eveshipfit/dogma-engine).

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde
```

## Usage

The examples use Vite's `?url` imports to get the URL of a data file.

```ts
import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { createEngine } from "@eveshipfit/fitting";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import { loadSde } from "@eveshipfit/sde-loader";

const engine = await createEngine(await loadSde({ url: sdeUrl }), { wasm: wasmUrl });

const fit = engine.createFit({ ship: 587 }); // a Rifter
fit.fit(engine.sde.typeByName("200mm AutoCannon II")!.id); // first free high slot
fit.fit(engine.sde.typeByName("EMP S")!.id); // loaded into every gun that takes it

const { stats } = fit.getSnapshot();
stats.ship.get("cpuLoad");
stats.slots.high; // { used: 1, total: 3 }
stats.violations; // the fitting rules the fit breaks

fit.undo();
```

The engine can hold only one SDE per page; `createEngine` with another one throws.

A fit is flown by a character with every skill at V, unless you pass another to `createFit` or `setCharacter`.

### React

`subscribe` and `getSnapshot` are bound, so a store goes straight into `useSyncExternalStore`:

```ts
const { fit, stats } = useSyncExternalStore(store.subscribe, store.getSnapshot);
```

Every change gives a new snapshot; old ones never change.

### Previews

`preview` shows what an edit would do, without doing it:

```ts
const { before, after } = fit.preview((draft) => draft.fit(typeId));
after.stats.ship.get("cpuLoad")! - before.stats.ship.get("cpuLoad")!;
```

### Rules

`placementOf`, `canFit`, `acceptsCharge` and `chargesFor` say where a type goes, whether a module fits a hull, and
which charges go in a module; for example to filter a market browser.

## License

MIT
