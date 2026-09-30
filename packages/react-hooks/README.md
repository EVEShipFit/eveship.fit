# @eveshipfit/react-hooks

React provider and hooks over [`@eveshipfit/fitting`](https://www.npmjs.com/package/@eveshipfit/fitting).

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde @eveshipfit/images react
```

## Usage

Create the engine once (see `@eveshipfit/fitting`) and wrap the app in `EveShipFitProvider`:

```tsx
import { EveShipFitProvider, useAttribute, useFitStore, useSlots } from "@eveshipfit/react-hooks";

root.render(
  <EveShipFitProvider engine={engine}>
    <App />
  </EveShipFitProvider>,
);

function App() {
  const store = useFitStore();
  const lows = useSlots("low");
  const cpu = useAttribute("cpuLoad");

  return (
    <p>
      {lows.length} low slots, CPU {cpu.text}
      <button onClick={() => store.fit(2048)}>Fit Damage Control II</button>
    </p>
  );
}
```

Without a `fit`, the provider starts with an empty Rifter.

### Previews

`usePreview` shows what an edit would do; while it does, `useStats`, `useAttribute` and the slot hooks return the
previewed values, `useAttribute` says whether that is `"better"` or `"worse"`, and `useSlots` and `useFighterTubes`
which slots only the preview fills:

```tsx
const preview = usePreview();

<button onMouseEnter={() => preview.show((draft) => draft.fit(typeId))} onMouseLeave={preview.clear} />;
```

### Images

To draw EVE's images, wrap the app in an `ImagesProvider` with the `Images` of `@eveshipfit/images`, and serve its
`dist/images/` folder at the `baseUrl` given; `useImages` reads them. It needs no engine:

```tsx
const images = await loadImages({ url: "/images.dat" }, { baseUrl: "/images/" });

<ImagesProvider images={images}>
```

### Texts

For the text EVE shows when hovering an attribute, wrap the app in a `TextsProvider` with the `Texts` of
`@eveshipfit/sde-loader`; `useAttributeTooltip` reads them:

```tsx
const texts = await loadTexts({ url: "/texts.dat" });

<TextsProvider texts={texts}>
```

### Browsing

`useMarketTree`, `useHullTree`, `useModuleTree` and `useChargeTree` give EVE's market, its ships, what goes on a ship and
its charges, cut down to what a filter keeps. `useModuleSearch` and `useChargeSearch` give what can be fitted and
the charges by root market group, as EVE shows search results. `useChargedModules` lists the fitted modules that load charges.
`usePlacement` says where a type goes, `useCanFit` whether it may go on the fit's ship, and `useDroneRoom` how many more
drones of a type can be active.

### Skills

`useCharacters` picks who flies the fit; `useMissingSkills` says which skills that character lacks to use some types, or
a whole fit.

### Price

`useFitPrice` gives the fit's estimated price in ISK, at the prices of the engine's `esi`; `undefined` without one, or until they are in. A type costs ESI's average price, else its adjusted price, else the price of the provider's `zkillboard`, asked only for what is fitted. Like `useAttribute`, it says whether a preview makes it `"better"` (cheaper) or `"worse"`.

### Saved fits

`useLocalFits` lists, saves and removes fits in `localStorage`; pass a `LocalFits` to the provider to store them
elsewhere.

## License

MIT
