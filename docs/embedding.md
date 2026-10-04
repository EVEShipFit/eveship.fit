# Showing a fit on your own site

The fitting wheel of [EVEShip.fit](https://eveship.fit) is a React component you can put on your own site.

## Install

```sh
npm install @eveshipfit/ui-ingame @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde @eveshipfit/images
```

## Data files

EVE's data comes with the npm packages; serve these from your site:

- `@eveshipfit/sde/dist/sde.dat`
- `@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm`
- `@eveshipfit/images/dist/images.dat`
- `@eveshipfit/images/dist/images/`

With [Vite](https://vite.dev/), `?url` imports take care of the first three. Copy the images folder, for example with
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

## Load the data

```ts
import wasmUrl from "@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm?url";
import { createEngine } from "@eveshipfit/fitting";
import { loadImages } from "@eveshipfit/images";
import imagesUrl from "@eveshipfit/images/dist/images.dat?url";
import sdeUrl from "@eveshipfit/sde/dist/sde.dat?url";
import { loadSde } from "@eveshipfit/sde-loader";

const [engine, images] = await Promise.all([
  loadSde({ url: sdeUrl }).then((sde) => createEngine(sde, { wasm: wasmUrl })),
  loadImages({ url: imagesUrl }, { baseUrl: "/images/" }),
]);
```

`baseUrl` is where you serve the images folder.

## Show a fit

```tsx
import "@eveshipfit/ui-ingame/theme.css";
import { EveShipFitProvider, ImagesProvider } from "@eveshipfit/react-hooks";
import { FittingWheel } from "@eveshipfit/ui-ingame";

root.render(
  <ImagesProvider images={images}>
    <EveShipFitProvider engine={engine} fit={engine.createFit(engine.loadText(eft))}>
      <FittingWheel readOnly />
    </EveShipFitProvider>
  </ImagesProvider>,
);
```

A fit can come from:

- `engine.loadText(text)`: EFT, as copied from EVE, Pyfa or EVEShip.fit.
- `await engine.loadLink(link)`: the `fit` value of an EVEShip.fit link.
- `engine.loadEsiFitting(fitting)`: a fitting from ESI.

`engine.saveLink(fit)` gives the `fit` value for a link to it on EVEShip.fit.

`EveShipFitProvider` takes `fit` once; to show another, give it a new `key`, or call `replace` on the fit.

For several fits on a page, give each its own `EveShipFitProvider`; they share the engine and the `ImagesProvider`.

### Options

- `readOnly`: the fit cannot be changed.
- `hideStats`: leaves out the hardpoints and the CPU, powergrid and calibration gauges.

Set `--esf-wheel-size` to change the width of the wheel.

The theme uses [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) if the page loads it, for example with
`@fontsource-variable/noto-sans`.

## Updating

Update `@eveshipfit/sde` and `@eveshipfit/images` to get the ships and modules of a new EVE release.

## More

Everything the wheel shows comes from the hooks of `@eveshipfit/react-hooks`; [the packages](../packages) have a
README each.
