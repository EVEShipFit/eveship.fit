# Showing a fit on your own site

The fitting wheel of [EVEShip.fit](https://eveship.fit) is a React component you can put on your own site.

## Install

```sh
npm install @eveshipfit/ui-ingame @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde @eveshipfit/images react react-dom
```

You need React 19.

## The data files

The wheel needs EVE's data, and it all comes with the npm packages. You serve these files from your own site:

| File                                                | Size              | What it is                     |
| --------------------------------------------------- | ----------------- | ------------------------------ |
| `@eveshipfit/sde/dist/sde.dat`                      | 10 MB             | Types, attributes, effects     |
| `@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm` | 0.5 MB            | The engine that does the maths |
| `@eveshipfit/images/dist/images.dat`                | 0.3 MB            | Which image goes with what     |
| `@eveshipfit/images/dist/images/`                   | 28 MB, 6000 files | The images                     |

A browser only fetches the images it shows, not all 28 MB. The files
never change within a version: cache them for as long as you like.

With [Vite](https://vite.dev/), a `?url` import gives the URL of a file, and Vite copies it into the build. The images
folder you copy yourself, for example with
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

With another bundler, copy the four files above into your public folder, and use their URLs instead.

## Load the data

Load everything once, when the page starts:

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

const fit = engine.createFit(engine.loadText(eft));

root.render(
  <ImagesProvider images={images}>
    <EveShipFitProvider engine={engine} fit={fit}>
      <FittingWheel readOnly />
    </EveShipFitProvider>
  </ImagesProvider>,
);
```

A fit can come from:

- `engine.loadText(text)`: EFT, as copied from EVE, Pyfa or EVEShip.fit.
- `await engine.loadLink(link)`: the `fit` value of an EVEShip.fit link.
- `engine.loadEsiFitting(fitting)`: a fitting a character saved in game, as ESI gives it.

To link to it on EVEShip.fit: `https://eveship.fit/?fit=${engine.saveLink(engine.loadText(eft))}`.

### Options

- `readOnly`: the fit can be looked at, not changed. Without it, visitors can click and drag modules around.
- `hideStats`: leaves out the hardpoints and the CPU, powergrid and calibration gauges.

### Size

The wheel is 572 pixels wide. Set `--esf-wheel-size` on it, or on anything around it, to change that:

```css
.my-fit {
  --esf-wheel-size: 400px;
}
```

### Font

The theme uses [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) when the page has it, and the system font
otherwise. To load it: `npm install @fontsource-variable/noto-sans`, and `import "@fontsource-variable/noto-sans";`.

## Several fits on a page

Load the data once, and give every fit its own `EveShipFitProvider`. One `ImagesProvider` around them all is enough:

```tsx
<ImagesProvider images={images}>
  {fits.map((fit) => (
    <EveShipFitProvider key={fit.id} engine={engine} fit={engine.createFit(engine.loadText(fit.eft))}>
      <FittingWheel readOnly />
    </EveShipFitProvider>
  ))}
</ImagesProvider>
```

The provider takes `fit` once. To show another fit in the same place, give the provider a new `key`, or call
`fit.replace(newFit)`.

## Updating

EVE changes with every patch. Update `@eveshipfit/sde` and `@eveshipfit/images` to keep up, and keep the other
packages on the versions they ask for.

## More

Everything the wheel shows comes from hooks in `@eveshipfit/react-hooks`; use them to draw your own. The READMEs of
[the packages](../packages) tell what each one does.
