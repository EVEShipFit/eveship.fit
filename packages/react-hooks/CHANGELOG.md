# @eveshipfit/react-hooks

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
