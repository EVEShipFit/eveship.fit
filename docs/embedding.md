# Showing fits on your own site

The fitting wheel of [EVEShip.fit](https://eveship.fit) is a React component you can use on your own site. It is
built from a few packages:

- `@eveshipfit/fitting` calculates fits, using EVE's data from `@eveshipfit/sde`.
- `@eveshipfit/react-hooks` makes a fit available to React components.
- `@eveshipfit/ui-ingame` draws the wheel, using the icons of `@eveshipfit/images`.

This guide takes you from installing them to a wheel on your page.

## 1. Install

```sh
npm install @eveshipfit/ui-ingame @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde @eveshipfit/images
```

## 2. Serve the data files

The wheel needs EVE's data in the browser. It comes with the packages, and your site serves it:

| File                                                | What it is                          |
| --------------------------------------------------- | ----------------------------------- |
| `@eveshipfit/sde/dist/sde.dat`                      | EVE's types, attributes and effects |
| `@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm` | The engine that calculates a fit    |
| `@eveshipfit/images/dist/images.dat`                | Which image belongs to which type   |
| `@eveshipfit/images/dist/images/`                   | The icons and textures              |

With [Vite](https://vite.dev/), the `?url` imports in the next step take care of the first three files. Copy the images
folder into your build, for example with
[vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy):

```js
// vite.config.js
import { viteStaticCopy } from "vite-plugin-static-copy";

export default {
  plugins: [
    viteStaticCopy({
      targets: [{ src: "node_modules/@eveshipfit/images/dist/images/*", dest: "images", rename: { stripBase: true } }],
    }),
  ],
};
```

With another bundler, copy all four into your public folder, and use their URLs in the next step.

## 3. Load the data

Create the engine and load the images when your page starts. A page can have only one engine; every fit on the page
uses it.

```ts
import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";

import { createEngine } from "@eveshipfit/fitting";
import { loadImages } from "@eveshipfit/images";
import { loadSde } from "@eveshipfit/sde-loader";

const [engine, images] = await Promise.all([
  loadSde({ url: sdeUrl }).then((sde) => createEngine(sde, { wasm: wasmUrl })),
  loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
]);
```

`baseUrl` is where you serve the images folder.

## 4. Show a fit

Turn your fit into a fit store with `engine.createFit`, and give it to an `EveShipFitProvider`. The `FittingWheel`
inside it draws that fit:

```tsx
import "@eveshipfit/ui-ingame/theme.css";
import { EveShipFitProvider, ImagesProvider } from "@eveshipfit/react-hooks";
import { FittingWheel } from "@eveshipfit/ui-ingame";

const fit = engine.createFit(engine.loadText(eft));

root.render(
  <ImagesProvider images={images}>
    <EveShipFitProvider engine={engine} fit={fit}>
      <FittingWheel readOnly />
    </EveShipFitProvider>
  </ImagesProvider>,
);
```

The provider takes `fit` once. To show another fit in the same place, give the provider a new `key`, or call
`fit.replace(newFit)`.

For several fits on one page, give each its own `EveShipFitProvider`. One `ImagesProvider` around all of them is
enough.

## Where fits come from

The engine reads fits in these forms:

- `engine.loadText(text)`: EFT or esf/1 text.
- `await engine.loadLink(link)`: the `fit` value of an EVEShip.fit link.
- `await engine.loadLink("killmail:<id>/<hash>")`: the fit of a killmail.
- `engine.loadEsiFitting(fitting)`: a fitting from ESI.

A killmail is fetched from ESI, so it needs an `Esi` of `@eveshipfit/esi` in `createEngine`:

```ts
import { Esi } from "@eveshipfit/esi";

const esi = new Esi({ userAgent: "MySite/1.0 (me@example.com; +https://example.com)" });
const engine = await createEngine(sde, { wasm: wasmUrl, esi });
```

To link to a fit on EVEShip.fit, use `https://eveship.fit/?fit=${engine.saveLink(fit.getSnapshot().fit)}`.

## Options

By default, visitors can change the fit on the wheel: switch modules between offline, online, active and overheated,
move and remove modules, and remove charges.

- `readOnly`: visitors can look at the fit, but not change it.
- `hideStats`: leaves out the hardpoints, and the CPU, powergrid and calibration gauges.

## Styling

Set `--esf-wheel-size` to change the width of the wheel:

```css
.my-fit {
  --esf-wheel-size: 400px;
}
```

The theme uses [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) if your page loads it, for example with
[`@fontsource-variable/noto-sans`](https://fontsource.org/fonts/noto-sans); otherwise, the system font.

## Keeping up with EVE

New ships and modules come with new versions of [`@eveshipfit/sde`](https://www.npmjs.com/package/@eveshipfit/sde) and
[`@eveshipfit/images`](https://www.npmjs.com/package/@eveshipfit/images). Update both after an EVE release.

## Going further

[`@eveshipfit/ui-ingame`](../packages/ui-ingame) has more of EVEShip.fit, like `ShipStatistics` and the whole
`FittingWindow`. To draw things your own way, the hooks of [`@eveshipfit/react-hooks`](../packages/react-hooks) give you
everything the wheel shows. [`@eveshipfit/fitting`](../packages/fitting) does the calculations, and
[`@eveshipfit/esi`](../packages/esi) talks to ESI.
