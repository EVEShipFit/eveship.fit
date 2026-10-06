# @eveshipfit/fitting

## 2.2.0

### Minor Changes

- Start up faster: find skills and modes without reading every type, and render hidden item browser tabs after the rest ([#240](https://github.com/EVEShipFit/eveship.fit/pull/240))

- Accept a promise for the `wasm` option of `createEngine` ([#239](https://github.com/EVEShipFit/eveship.fit/pull/239))

### Patch Changes

- Show the fit sooner: find charges by their groups, and fill the item browser after the rest ([#241](https://github.com/EVEShipFit/eveship.fit/pull/241))

- Drag a squadron to another fighter tube, swapping it with what is there ([#225](https://github.com/EVEShipFit/eveship.fit/pull/225))
- Updated dependencies [[`bb4a838`](https://github.com/EVEShipFit/eveship.fit/commit/bb4a838cfac6ae9273a2f7f83258b64fcd0805ae), [`e0a09af`](https://github.com/EVEShipFit/eveship.fit/commit/e0a09af187df7daf47885e2594b185d304d1bbf8)]:
  - @eveshipfit/sde-loader@2.0.0

## 2.1.0

### Minor Changes

- Load fits from DNA, in `loadText` and as a `dna:` link, and require `@eveshipfit/dogma-engine` 13.4.0 ([#206](https://github.com/EVEShipFit/eveship.fit/pull/206))

- Add `Engine.saveLink`, and read `esf1` links ([#193](https://github.com/EVEShipFit/eveship.fit/pull/193))

- Show the fittings of the logged-in character under Personal Fittings ([#199](https://github.com/EVEShipFit/eveship.fit/pull/199))

- Add `Engine.loadText` and `Engine.saveText`, for EFT and esf/1 text ([#195](https://github.com/EVEShipFit/eveship.fit/pull/195))

- Set an imported EFT or ESI fit to the states EVE gives it ([#204](https://github.com/EVEShipFit/eveship.fit/pull/204))

- Switch the mode of a tactical destroyer or Anhinga on the fitting wheel ([#207](https://github.com/EVEShipFit/eveship.fit/pull/207))

- Add `loadV1Fits`, to read the fits v1 kept in localStorage ([#198](https://github.com/EVEShipFit/eveship.fit/pull/198))

### Patch Changes

- Put rigs offline and back online on the fitting wheel, and require `@eveshipfit/dogma-engine` 13.5.0 ([#209](https://github.com/EVEShipFit/eveship.fit/pull/209))
- Updated dependencies [[`0dd12de`](https://github.com/EVEShipFit/eveship.fit/commit/0dd12de0baf887771615a1c29addd345247b6ed8), [`1d62f20`](https://github.com/EVEShipFit/eveship.fit/commit/1d62f20580bb837e34f886d1b8d8849dea7f455c), [`d59db39`](https://github.com/EVEShipFit/eveship.fit/commit/d59db39904b94227efa7ed205b8db86a59470276)]:
  - @eveshipfit/esi@1.1.0
  - @eveshipfit/sde-loader@1.4.0

## 2.0.0

### Major Changes

- Killmail links need an `Esi` in `createEngine`'s `esi` option ([#181](https://github.com/EVEShipFit/eveship.fit/pull/181))

### Minor Changes

- Launch fighters: `fit` puts a full squadron in the first free tube of its kind, else in the fighter bay; add `fighterTubes` to `Stats`, `setSquadronSize` and `setFighterBayQuantity` to `FitStore`, and `fighterKind`, `squadronSize` and `tubeTakes` ([#179](https://github.com/EVEShipFit/eveship.fit/pull/179))

- Add `fitPrice`, and expose `Engine.esi` ([#182](https://github.com/EVEShipFit/eveship.fit/pull/182))

### Patch Changes

- `canFit` checks the tubes of a structure for a standup fighter ([#179](https://github.com/EVEShipFit/eveship.fit/pull/179))
- Updated dependencies [[`ff1ef59`](https://github.com/EVEShipFit/eveship.fit/commit/ff1ef59c6de6aee810583c60f582553e0c8d03eb)]:
  - @eveshipfit/esi@1.0.0

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
