# Moving from `@eveshipfit/react`

`@eveshipfit/react` (v1) is replaced by a set of packages. This page covers sites that show a fit with `<ShipFit>`; for
the full setup, see [embedding.md](embedding.md).

## What changed

- The packages are on the public npm registry; no GitHub login to install them.
- React 19 instead of 18.
- One `EveShipFitProvider` instead of nine nested providers, plus an `ImagesProvider` for the icons.
- No more `dataUrl` and no more data.eveship.fit: the data files come with the npm packages, and you serve them with your
  site.

## Before and after

v1, as in its Storybook:

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

v2, once the [data is loaded](embedding.md#load-the-data):

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

## `<ShipFit>` props

| v1          | v2                                            |
| ----------- | --------------------------------------------- |
| `readOnly`  | `readOnly`                                    |
| `withStats` | Shown by default; `hideStats` leaves them out |
| `isPreview` | Gone, with the link on the wheel; see below   |

v1 drew a "share fit" link on the wheel. v2 does not; to link to the fit on EVEShip.fit, make your own:
`https://eveship.fit/?fit=${engine.saveLink(fit)}`.

## Fits

v1's `EsfFit` (`shipTypeId`, `modules`, `drones`, `cargo`) is replaced by `Fit` (`ship`, `items`). How to get one:

| v1                              | v2                                                     |
| ------------------------------- | ------------------------------------------------------ |
| `useImportEft`                  | `engine.loadText(eft)`                                 |
| `useImportEveShipFit`           | `await engine.loadLink(link)`; old v1 links still load |
| `useImportEsiFitting`           | `engine.loadEsiFitting(fitting)`                       |
| `useExportEft`                  | `engine.saveText(fit, "eft")`                          |
| `useExportEveShipFit`           | `engine.saveLink(fit)`                                 |
| `CurrentFitProvider`'s `setFit` | `fit` of `EveShipFitProvider`, or `store.replace(fit)` |

Kept `EsfFit` objects, for example in a database? `loadV1Fits` of `@eveshipfit/fitting` reads them:
`loadV1Fits(JSON.stringify([esfFit]))[0]`. Storing fits as EFT text or links is easier from then on.

## Other components

| v1                   | v2                                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| `ShipStatistics`     | `ShipStatistics` of `@eveshipfit/ui-ingame`; also needs a `TextsProvider` |
| `ShipFitExtended`    | `FittingWindow`                                                           |
| `HardwareListing`    | `ItemBrowser`                                                             |
| `StatisticsProvider` | `useStats` and `useAttribute` of `@eveshipfit/react-hooks`                |
| `useEveData`         | `engine.sde`, see `@eveshipfit/sde-loader`                                |
