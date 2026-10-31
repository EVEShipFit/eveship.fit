# @eveshipfit/react-hooks

## 2.5.0

### Minor Changes

- Add `fitPriceItems`, and `items` to `useFitPrice` ([#309](https://github.com/EVEShipFit/eveship.fit/pull/309))

- Add `useHasRoom` ([#307](https://github.com/EVEShipFit/eveship.fit/pull/307))

- Hovering the Simulation History previews that fit ([#308](https://github.com/EVEShipFit/eveship.fit/pull/308))

- Add `useTypeBonuses` ([#312](https://github.com/EVEShipFit/eveship.fit/pull/312))

### Patch Changes

- Updated dependencies [[`d805b5c`](https://github.com/EVEShipFit/eveship.fit/commit/d805b5c967665ca4f303f097f3621edf9b4272c2), [`8336fc4`](https://github.com/EVEShipFit/eveship.fit/commit/8336fc4aea6e90cbb8945a59a9fa73e429e6c17b), [`722bc02`](https://github.com/EVEShipFit/eveship.fit/commit/722bc0299b315e52617d6568667b4eb29a42cb10), [`d390b93`](https://github.com/EVEShipFit/eveship.fit/commit/d390b93c44788ef41da764236fa7bfb550dae6b5)]:
  - @eveshipfit/fitting@2.5.0
  - @eveshipfit/sde-loader@4.0.0

## 2.4.0

### Minor Changes

- Show Info on the hull, with the values on the fit ([#268](https://github.com/EVEShipFit/eveship.fit/pull/268))

- Add `useHullRefuses` and `useRefusal`, for a type the fit's ship cannot fit ([#292](https://github.com/EVEShipFit/eveship.fit/pull/292))

### Patch Changes

- The Item Browser no longer re-filters its tree on every hover ([#281](https://github.com/EVEShipFit/eveship.fit/pull/281))

- Keep the hover preview when a character is saved with the same skills ([#276](https://github.com/EVEShipFit/eveship.fit/pull/276))

- Keep working where the browser blocks IndexedDB ([#274](https://github.com/EVEShipFit/eveship.fit/pull/274))

- A preview's price includes what only zKillboard can price ([#283](https://github.com/EVEShipFit/eveship.fit/pull/283))

- Require @eveshipfit/images 3, like @eveshipfit/ui-ingame ([#282](https://github.com/EVEShipFit/eveship.fit/pull/282))

- Fix the EsiCharacters and usePreview examples in the README ([#280](https://github.com/EVEShipFit/eveship.fit/pull/280))

- A failed zKillboard price is asked for again ([#279](https://github.com/EVEShipFit/eveship.fit/pull/279))
- Updated dependencies [[`f522554`](https://github.com/EVEShipFit/eveship.fit/commit/f5225545ab5a12e4133ae7beb2975f0a7dd4097c), [`5287b0a`](https://github.com/EVEShipFit/eveship.fit/commit/5287b0a7f1fcd65dbaa80ae55bc5a5b3a6769e2b), [`91c4688`](https://github.com/EVEShipFit/eveship.fit/commit/91c4688807a0a4c42c9208ad0afd80d7b3e1d149), [`9a003be`](https://github.com/EVEShipFit/eveship.fit/commit/9a003be7f8bd1f07bc7132804f785fc23747ecc4), [`7b9be66`](https://github.com/EVEShipFit/eveship.fit/commit/7b9be668ff11140ec259c1a6b36f44691ab6c3d2)]:
  - @eveshipfit/fitting@2.4.1
  - @eveshipfit/zkillboard@1.0.1

## 2.3.1

### Patch Changes

- Updated dependencies [[`ea1788d`](https://github.com/EVEShipFit/eveship.fit/commit/ea1788d98d671487ad2b155dc0e57c4622ed6040)]:
  - @eveshipfit/fitting@2.4.0

## 2.3.0

### Minor Changes

- Filter implants and boosters by kind and skills, list them by slot, and click an implant or booster slot to browse it ([#250](https://github.com/EVEShipFit/eveship.fit/pull/250))

- Clicking an empty slot shows the modules for that slot and hull in the item browser ([#244](https://github.com/EVEShipFit/eveship.fit/pull/244))

- Pick a damage profile for the ehp, or make your own ([#254](https://github.com/EVEShipFit/eveship.fit/pull/254))

- Show Info has a Variations tab; on a fitted item, hovering one previews it, and double clicking fits it instead ([#255](https://github.com/EVEShipFit/eveship.fit/pull/255))

- Show Info on a module, charge or other item shows its attributes next to it, on the fit when fitted ([#248](https://github.com/EVEShipFit/eveship.fit/pull/248))

- Hovering a type in the item browser shows its name and estimated price ([#249](https://github.com/EVEShipFit/eveship.fit/pull/249))

### Patch Changes

- Updated dependencies [[`48a5524`](https://github.com/EVEShipFit/eveship.fit/commit/48a552406d21adf612160aba1cb9795d70135712), [`ab07819`](https://github.com/EVEShipFit/eveship.fit/commit/ab07819dea96497e6a7660ebb826e6520fe1f598), [`e18bfb6`](https://github.com/EVEShipFit/eveship.fit/commit/e18bfb624ab032d5efaaa6623d3b86915f4bff06), [`b1d5ae3`](https://github.com/EVEShipFit/eveship.fit/commit/b1d5ae33ba3778a8514a4219a14c9cfcb8972ba9), [`b1d5ae3`](https://github.com/EVEShipFit/eveship.fit/commit/b1d5ae33ba3778a8514a4219a14c9cfcb8972ba9)]:
  - @eveshipfit/fitting@2.3.0
  - @eveshipfit/sde-loader@3.0.0

## 2.2.0

### Minor Changes

- Add implants and boosters to the fitting wheel, and an Implants tab to the item browser ([#242](https://github.com/EVEShipFit/eveship.fit/pull/242))

### Patch Changes

- Updated dependencies [[`25d67af`](https://github.com/EVEShipFit/eveship.fit/commit/25d67af9a312533dd5cfd93bbeac1b117a87c061)]:
  - @eveshipfit/sde-loader@2.1.0
  - @eveshipfit/fitting@2.2.1

## 2.1.1

### Patch Changes

- Refresh a character's login in one tab at a time ([#233](https://github.com/EVEShipFit/eveship.fit/pull/233))
- Updated dependencies [[`bb4a838`](https://github.com/EVEShipFit/eveship.fit/commit/bb4a838cfac6ae9273a2f7f83258b64fcd0805ae), [`e0a09af`](https://github.com/EVEShipFit/eveship.fit/commit/e0a09af187df7daf47885e2594b185d304d1bbf8), [`cda647e`](https://github.com/EVEShipFit/eveship.fit/commit/cda647e16b9566cf7e2e838facca03b798197cb0), [`0da3a91`](https://github.com/EVEShipFit/eveship.fit/commit/0da3a9124f75c7fefafbb6beaf5c16c1d823b19b), [`e0a09af`](https://github.com/EVEShipFit/eveship.fit/commit/e0a09af187df7daf47885e2594b185d304d1bbf8), [`f2d20f6`](https://github.com/EVEShipFit/eveship.fit/commit/f2d20f6fb6c995f69f01494395535627d30d3b28)]:
  - @eveshipfit/sde-loader@2.0.0
  - @eveshipfit/fitting@2.2.0

## 2.1.0

### Minor Changes

- Fly the fit with the skills of characters logged in through EVE ([#190](https://github.com/EVEShipFit/eveship.fit/pull/190))

- Show the fittings of the logged-in character under Personal Fittings ([#199](https://github.com/EVEShipFit/eveship.fit/pull/199))

- Keep saved fits in IndexedDB, and show fits saved in other tabs ([#196](https://github.com/EVEShipFit/eveship.fit/pull/196))

- Show the max velocity in the tooltip of a microwarpdrive or afterburner ([#210](https://github.com/EVEShipFit/eveship.fit/pull/210))

- Switch the mode of a tactical destroyer or Anhinga on the fitting wheel ([#207](https://github.com/EVEShipFit/eveship.fit/pull/207))

### Patch Changes

- Name the characters `All L5` and `All L0` ([#188](https://github.com/EVEShipFit/eveship.fit/pull/188))

- Set an imported EFT or ESI fit to the states EVE gives it ([#204](https://github.com/EVEShipFit/eveship.fit/pull/204))
- Updated dependencies [[`8f8a171`](https://github.com/EVEShipFit/eveship.fit/commit/8f8a171886bba06f8baf68552afbd667c83bee09), [`8de62cd`](https://github.com/EVEShipFit/eveship.fit/commit/8de62cd2c2bc4b077c74f15a351f271bdc168539), [`0dd12de`](https://github.com/EVEShipFit/eveship.fit/commit/0dd12de0baf887771615a1c29addd345247b6ed8), [`1d62f20`](https://github.com/EVEShipFit/eveship.fit/commit/1d62f20580bb837e34f886d1b8d8849dea7f455c), [`01510af`](https://github.com/EVEShipFit/eveship.fit/commit/01510af02697a8b512f82084ffc12b0c24b5ebcf), [`3970335`](https://github.com/EVEShipFit/eveship.fit/commit/3970335be9da0aeca645b928656167ff5e122945), [`d59db39`](https://github.com/EVEShipFit/eveship.fit/commit/d59db39904b94227efa7ed205b8db86a59470276), [`a15584d`](https://github.com/EVEShipFit/eveship.fit/commit/a15584d586e55db9f0893b921d2b575633626820), [`e106f8a`](https://github.com/EVEShipFit/eveship.fit/commit/e106f8ab312bcbe64cd126e1aff6771bf10ea150), [`9c4c190`](https://github.com/EVEShipFit/eveship.fit/commit/9c4c190f0ea66c0f0304da31580d90b73103c9e4)]:
  - @eveshipfit/fitting@2.1.0
  - @eveshipfit/esi@1.1.0
  - @eveshipfit/sde-loader@1.4.0

## 2.0.0

### Major Changes

- Round stats the way EVE's fitting window does, and drop `roundingOf` ([#180](https://github.com/EVEShipFit/eveship.fit/pull/180))

### Minor Changes

- Drag a hull from the `ItemBrowser` to the middle of the fitting wheel to simulate it ([#177](https://github.com/EVEShipFit/eveship.fit/pull/177))

- Add `useFighterTubes` and `useFighterTubeUsage`, and let `useBayContents` read the fighter bay ([#179](https://github.com/EVEShipFit/eveship.fit/pull/179))

- Add `useFitPrice`, with the provider's `zkillboard` pricing what ESI has no price for ([#182](https://github.com/EVEShipFit/eveship.fit/pull/182))

### Patch Changes

- Updated dependencies [[`114f043`](https://github.com/EVEShipFit/eveship.fit/commit/114f043ac89f032d5fc8be978686440e3b920301), [`1ae802c`](https://github.com/EVEShipFit/eveship.fit/commit/1ae802c6695613aabc60e6e70ab5d720acbc3ec8), [`114f043`](https://github.com/EVEShipFit/eveship.fit/commit/114f043ac89f032d5fc8be978686440e3b920301), [`ff1ef59`](https://github.com/EVEShipFit/eveship.fit/commit/ff1ef59c6de6aee810583c60f582553e0c8d03eb), [`1ae802c`](https://github.com/EVEShipFit/eveship.fit/commit/1ae802c6695613aabc60e6e70ab5d720acbc3ec8)]:
  - @eveshipfit/zkillboard@1.0.0
  - @eveshipfit/fitting@2.0.0

## 1.4.0

### Minor Changes

- Let `useBayUsage` read the fighter bay ([#173](https://github.com/EVEShipFit/eveship.fit/pull/173))

- Export `useShownSnapshot` ([#171](https://github.com/EVEShipFit/eveship.fit/pull/171))

### Patch Changes

- Updated dependencies [[`cdccf67`](https://github.com/EVEShipFit/eveship.fit/commit/cdccf67748d9c533eade09ab4bacffa1eee1e44b), [`a09defb`](https://github.com/EVEShipFit/eveship.fit/commit/a09defb750560c7aa22d4be61982e0a931fcd754), [`a76a21d`](https://github.com/EVEShipFit/eveship.fit/commit/a76a21db5a51bec86a2aaf5b6f495fc2ff995aaa), [`f8300fe`](https://github.com/EVEShipFit/eveship.fit/commit/f8300fe2efb9d5e30f28dc51a06572498006a7c3)]:
  - @eveshipfit/fitting@1.3.0
  - @eveshipfit/sde-loader@1.3.0

## 1.3.0

### Minor Changes

- Add `useDroneRoom`; `useBayContents` counts the active items of a type ([#162](https://github.com/EVEShipFit/eveship.fit/pull/162))

- Add `moduleSearch`, `chargeSearch`, `useModuleSearch` and `useChargeSearch`: what can be fitted and the charges, by root market group ([#165](https://github.com/EVEShipFit/eveship.fit/pull/165))

- `usePreview` takes a drop target, which only clears the preview it showed ([#164](https://github.com/EVEShipFit/eveship.fit/pull/164))

- Add `useBayContents` ([#161](https://github.com/EVEShipFit/eveship.fit/pull/161))

### Patch Changes

- Updated dependencies [[`aab4579`](https://github.com/EVEShipFit/eveship.fit/commit/aab45798762874183375a639b10a6ce0f83cad9a), [`afc982f`](https://github.com/EVEShipFit/eveship.fit/commit/afc982fa78202950eb5c91fba7dd3e5f55b68c4d), [`a2bb26f`](https://github.com/EVEShipFit/eveship.fit/commit/a2bb26f5e73db35ed87255caf8b357f60ec8ec4b), [`4acc8e3`](https://github.com/EVEShipFit/eveship.fit/commit/4acc8e351d6592a7f7d32170ecac2507d07cb5d7), [`a2bb26f`](https://github.com/EVEShipFit/eveship.fit/commit/a2bb26f5e73db35ed87255caf8b357f60ec8ec4b)]:
  - @eveshipfit/fitting@1.2.0
  - @eveshipfit/sde-loader@1.2.0

## 1.2.0

### Minor Changes

- Add `useViolations` and `useBayUsage`; `useFitHistory` gives `length`, `position` and `goTo` ([#142](https://github.com/EVEShipFit/eveship.fit/pull/142))

- Round attributes towards worse; add `formatDuration` and `formatClock` ([#143](https://github.com/EVEShipFit/eveship.fit/pull/143))

- `useMissingSkills` also takes a whole fit ([#151](https://github.com/EVEShipFit/eveship.fit/pull/151))

- The slot hooks follow the preview ([#153](https://github.com/EVEShipFit/eveship.fit/pull/153))

- Add `TextsProvider`, `useTexts` and `useAttributeTooltip`: the text EVE shows when hovering an attribute ([#146](https://github.com/EVEShipFit/eveship.fit/pull/146))

- Add `useChargeTree` and `useChargedModules` ([#156](https://github.com/EVEShipFit/eveship.fit/pull/156))

- Add `useCharges`: every charge a module can load ([#133](https://github.com/EVEShipFit/eveship.fit/pull/133))

- Add `useMissingSkills`, the skills the fit's character lacks to use some types ([#150](https://github.com/EVEShipFit/eveship.fit/pull/150))

- Add `useModuleTree`, `usePlacement` and `useCanFit` ([#152](https://github.com/EVEShipFit/eveship.fit/pull/152))

### Patch Changes

- Round 0.19999999 from the SDE as 0.2, not down to 0.1 ([#144](https://github.com/EVEShipFit/eveship.fit/pull/144))
- Updated dependencies [[`9efea15`](https://github.com/EVEShipFit/eveship.fit/commit/9efea15cfd282fd5ab8e3273ea4a7279c503b477), [`2645240`](https://github.com/EVEShipFit/eveship.fit/commit/2645240608d9e0620598bcfed1464c57cab7ef22), [`4a93066`](https://github.com/EVEShipFit/eveship.fit/commit/4a9306648a5a5ca2ebf947cbb368100df6e61f2a), [`22074fe`](https://github.com/EVEShipFit/eveship.fit/commit/22074fe43ed39e5464d8c5bf0b6d75d6f39287e2), [`2ffedb8`](https://github.com/EVEShipFit/eveship.fit/commit/2ffedb891ac8ecdf56bae567d34856692ac26da5), [`9efea15`](https://github.com/EVEShipFit/eveship.fit/commit/9efea15cfd282fd5ab8e3273ea4a7279c503b477), [`c1e35ba`](https://github.com/EVEShipFit/eveship.fit/commit/c1e35ba7939d4c64ed3e7a3596c703ea8fbd4125), [`fc205bc`](https://github.com/EVEShipFit/eveship.fit/commit/fc205bcc783f9e39f9645d6dbad305c8b10006bb), [`7d8f133`](https://github.com/EVEShipFit/eveship.fit/commit/7d8f1338fb392600ca329f23949efdf77d23c65f)]:
  - @eveshipfit/fitting@1.1.0
  - @eveshipfit/sde-loader@1.1.0

## 1.1.0

### Minor Changes

- Add `ImagesProvider` and `useImages`, to give components the `Images` of `@eveshipfit/images` without an engine ([#128](https://github.com/EVEShipFit/eveship.fit/pull/128))

## 1.0.0

### Major Changes

- Add react-hooks: a provider and hooks over fitting ([#116](https://github.com/EVEShipFit/eveship.fit/pull/116))
