# Showing a fit on your own site

The fitting wheel of [EVEShip.fit](https://eveship.fit) is a React component you can put on your own site.

## Install

```sh
npm install @eveshipfit/ui-ingame @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde @eveshipfit/images
```

## Data files

The wheel needs EVE's data. It comes with the npm packages, and you serve it from your own site:

| File                                                | What it is                          |
| --------------------------------------------------- | ----------------------------------- |
| `@eveshipfit/sde/dist/sde.dat`                      | EVE's types, attributes and effects |
| `@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm` | The engine that calculates the fit  |
| `@eveshipfit/images/dist/images.dat`                | Which image belongs to which type   |
| `@eveshipfit/images/dist/images/`                   | The icons and textures              |

With [Vite](https://vite.dev/), the `?url` imports below take care of the first three. The images folder you copy
yourself, for example with [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy):

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

With another bundler, copy all four into your public folder, and use their URLs in the code below.

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

To link to the fit on EVEShip.fit: `https://eveship.fit/?fit=${engine.saveLink(fit)}`.

`EveShipFitProvider` takes `fit` only once. To show another fit in the same place, give the provider a new `key`, or
call `replace` on the fit.

### Several fits on a page

Give each fit its own `EveShipFitProvider`. They share the engine and the `ImagesProvider`:

```tsx
<ImagesProvider images={images}>
  {fits.map((fit) => (
    <EveShipFitProvider key={fit.id} engine={engine} fit={engine.createFit(engine.loadText(fit.eft))}>
      <FittingWheel readOnly />
    </EveShipFitProvider>
  ))}
</ImagesProvider>
```

## Options

By default, visitors can change the fit: click a module to change its state, and drag modules on and off the wheel.

- `readOnly`: shows the fit as it is.
- `hideStats`: leaves out the hardpoints and the CPU, powergrid and calibration gauges.

## Styling

Set `--esf-wheel-size` to change the width of the wheel:

```css
.my-fit {
  --esf-wheel-size: 400px;
}
```

The theme uses [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) if the page loads it, for example with
[`@fontsource-variable/noto-sans`](https://fontsource.org/fonts/noto-sans), and the system font otherwise.

## Updating

Update `@eveshipfit/sde` and `@eveshipfit/images` to get the ships and modules of a new EVE release.

## More

Everything the wheel shows comes from the hooks of `@eveshipfit/react-hooks`, if you want to draw parts yourself.
[The packages](../packages) each have a README.
