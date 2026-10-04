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

### Killmails

A killmail loads as a link, `killmail:<id>/<hash>`. The engine fetches it from ESI, so give it an `Esi` of
`@eveshipfit/esi` (`npm install @eveshipfit/esi`), with a user agent that tells ESI who you are:

```ts
import { Esi } from "@eveshipfit/esi";

const esi = new Esi({ userAgent: "MySite/1.0 (me@example.com; +https://example.com)" });
const engine = await createEngine(sde, { wasm: wasmUrl, esi });

const fit = await engine.loadLink(`killmail:${killmailId}/${killmailHash}`);
```

ESI lists the id and hash of the killmails of a character or corporation; zKillboard's API gives them for every kill.

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

- `readOnly`: visitors can only look at the fit. Without it, the wheel works as on EVEShip.fit: visitors can click a
  module to change its state (offline, online, active, overheated), drag modules to other slots or off the wheel, and
  use the buttons that show when hovering a module. Their changes stay on your page; nothing is saved.
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
