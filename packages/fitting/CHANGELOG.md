# @eveshipfit/fitting

## 1.3.0

### Minor Changes

- Add `Engine.loadLink` to load the fit of an EVEShip.fit link, and require `@eveshipfit/dogma-engine` 13.1.0 ([#170](https://github.com/EVEShipFit/eveship.fit/pull/170))

- Add `fighterBay`, `structure` and `fuel` to `Stats`; a structure's cargo hold is no longer overloaded ([#173](https://github.com/EVEShipFit/eveship.fit/pull/173))

### Patch Changes

- Updated dependencies [[`a09defb`](https://github.com/EVEShipFit/eveship.fit/commit/a09defb750560c7aa22d4be61982e0a931fcd754), [`f8300fe`](https://github.com/EVEShipFit/eveship.fit/commit/f8300fe2efb9d5e30f28dc51a06572498006a7c3)]:
  - @eveshipfit/sde-loader@1.3.0

## 1.2.0

### Minor Changes

- `fit` only puts a type in the cargo when given the cargo slot, which takes anything ([#164](https://github.com/EVEShipFit/eveship.fit/pull/164))

- `remove` takes several items, as one step in the history ([#161](https://github.com/EVEShipFit/eveship.fit/pull/161))

- Add `setActiveDrones`, `setDroneQuantity` and `droneRoom`; new drones are active only while there is room ([#162](https://github.com/EVEShipFit/eveship.fit/pull/162))

- Add `setCargoQuantity` ([#161](https://github.com/EVEShipFit/eveship.fit/pull/161))

### Patch Changes

- Updated dependencies [[`afc982f`](https://github.com/EVEShipFit/eveship.fit/commit/afc982fa78202950eb5c91fba7dd3e5f55b68c4d)]:
  - @eveshipfit/sde-loader@1.2.0

## 1.1.0

### Minor Changes

- `canFit` follows more of EVE's hull rules ([#152](https://github.com/EVEShipFit/eveship.fit/pull/152))

- The `FitStore` history keeps every fit, with `goTo`, `historyLength` and `historyPosition`; add `Stats.droneBay` ([#142](https://github.com/EVEShipFit/eveship.fit/pull/142))

- Add `missingSkills`, the skills a character lacks to use some types, with the skills those skills need ([#150](https://github.com/EVEShipFit/eveship.fit/pull/150))

- Add `move` ([#154](https://github.com/EVEShipFit/eveship.fit/pull/154))

- Add `typesInUse` ([#151](https://github.com/EVEShipFit/eveship.fit/pull/151))

### Patch Changes

- Updated dependencies [[`2645240`](https://github.com/EVEShipFit/eveship.fit/commit/2645240608d9e0620598bcfed1464c57cab7ef22), [`22074fe`](https://github.com/EVEShipFit/eveship.fit/commit/22074fe43ed39e5464d8c5bf0b6d75d6f39287e2), [`9efea15`](https://github.com/EVEShipFit/eveship.fit/commit/9efea15cfd282fd5ab8e3273ea4a7279c503b477), [`fc205bc`](https://github.com/EVEShipFit/eveship.fit/commit/fc205bcc783f9e39f9645d6dbad305c8b10006bb)]:
  - @eveshipfit/sde-loader@1.1.0

## 1.0.0

### Major Changes

- Add fitting: a fit that recalculates itself ([#114](https://github.com/EVEShipFit/eveship.fit/pull/114))
