# Moving from `@eveshipfit/react`

`@eveshipfit/react` (v1) is replaced by a set of smaller packages. This guide is for sites that draw a fit with
`<ShipFit>`, and walks through the move step by step. [embedding.md](embedding.md) has the full setup of v2.

In short:

- You serve EVE's data from your own site; `dataUrl` and data.eveship.fit are gone.
- One `EveShipFitProvider` replaces the nine nested providers.
- `<ShipFit>` becomes `<FittingWheel>`.
- Fits are `Fit` objects instead of `EsfFit`, and the engine reads and writes them.
- React 19 instead of 18.

## 1. Change the packages

Remove `@eveshipfit/react`, and the GitHub Packages registry from your `.npmrc`; the new packages are on npm. Then
install them as in [step 1 of embedding.md](embedding.md#1-install).

## 2. Serve the data files

v1 loaded its data from `dataUrl`. In v2 the data comes with the packages, and your site serves it. Follow
[steps 2 and 3 of embedding.md](embedding.md#2-serve-the-data-files); they replace `EveDataProvider` and
`DogmaEngineProvider`.

## 3. Replace the providers

v1 needed nine providers around `<ShipFit>`:

```tsx
<EveDataProvider dataUrl="/data/">
  <DogmaEngineProvider>
    <CurrentFitProvider initialFit={fit}>
      <LocalFitsProvider>
        <DefaultCharactersProvider>
          <EsiCharactersProvider>
            <CurrentCharacterProvider>
              <StatisticsProvider>
                <FitManagerProvider>
                  <ShipFit withStats readOnly />
                </FitManagerProvider>
              </StatisticsProvider>
            </CurrentCharacterProvider>
          </EsiCharactersProvider>
        </DefaultCharactersProvider>
      </LocalFitsProvider>
    </CurrentFitProvider>
  </DogmaEngineProvider>
</EveDataProvider>
```

v2 needs an `EveShipFitProvider` for the fit, and an `ImagesProvider` for the icons:

```tsx
import "@eveshipfit/ui-ingame/theme.css";
import { EveShipFitProvider, ImagesProvider } from "@eveshipfit/react-hooks";
import { FittingWheel } from "@eveshipfit/ui-ingame";

<ImagesProvider images={images}>
  <EveShipFitProvider engine={engine} fit={engine.createFit(engine.loadText(eft))}>
    <FittingWheel readOnly />
  </EveShipFitProvider>
</ImagesProvider>;
```

## 4. Replace `<ShipFit>`

`<FittingWheel>` takes the place of `<ShipFit>`:

| `<ShipFit>` | `<FittingWheel>`                                       |
| ----------- | ------------------------------------------------------ |
| `readOnly`  | `readOnly`                                             |
| `withStats` | The stats are shown by default; `hideStats` hides them |
| `isPreview` | Gone                                                   |

## 5. Convert your fits

v1's `EsfFit` (`shipTypeId`, `modules`, `drones`, `cargo`) is replaced by `Fit` (`ship`, `items`). The engine reads and
writes every format v1 did, and esf/1:

| v1                              | v2                                                     |
| ------------------------------- | ------------------------------------------------------ |
| `useImportEft`                  | `engine.loadText(eft)`                                 |
| `useExportEft`                  | `engine.saveText(fit, "eft")`                          |
| (new)                           | `engine.loadText(esf)`                                 |
| (new)                           | `engine.saveText(fit, "esf")`                          |
| `useImportEveShipFit`           | `await engine.loadLink(link)`; v1 links load too       |
| `useExportEveShipFit`           | `engine.saveLink(fit)`                                 |
| `useImportEsiFitting`           | `engine.loadEsiFitting(fitting)`                       |
| `CurrentFitProvider`'s `setFit` | `fit` of `EveShipFitProvider`, or `store.replace(fit)` |

If you kept `EsfFit` objects, for example in a database, `loadV1Fits` of `@eveshipfit/fitting` converts them:
`loadV1Fits(JSON.stringify([esfFit]))[0]`.

## Other components

If you used more than `<ShipFit>`:

| v1                   | v2                                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| `ShipStatistics`     | `ShipStatistics` of `@eveshipfit/ui-ingame`; also needs a `TextsProvider` |
| `ShipFitExtended`    | `FittingWindow`                                                           |
| `HardwareListing`    | `ItemBrowser`                                                             |
| `StatisticsProvider` | `useStats` and `useAttribute` of `@eveshipfit/react-hooks`                |
| `useEveData`         | `engine.sde`, see `@eveshipfit/sde-loader`                                |
