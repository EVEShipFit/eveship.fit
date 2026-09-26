# @eveshipfit/react-hooks

React provider and hooks over [`@eveshipfit/fitting`](https://www.npmjs.com/package/@eveshipfit/fitting).

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/react-hooks @eveshipfit/fitting @eveshipfit/dogma-engine @eveshipfit/sde-loader @eveshipfit/sde react
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

`usePreview` shows what an edit would do; while it does, `useStats` and `useAttribute` return the previewed values, and
`useAttribute` says whether that is `"better"` or `"worse"`:

```tsx
const preview = usePreview();

<button onMouseEnter={() => preview.show((draft) => draft.fit(typeId))} onMouseLeave={preview.clear} />;
```

### Saved fits

`useLocalFits` lists, saves and removes fits in `localStorage`; pass a `LocalFits` to the provider to store them
elsewhere.

## License

MIT
