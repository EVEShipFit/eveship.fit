# @eveshipfit/ui-ingame

## 1.1.0

### Minor Changes

- Add `CapacitorRing`, which `CapacitorStats` shows next to its values, and let `Stat` leave out its icon space with `icon={null}` ([#145](https://github.com/EVEShipFit/eveship.fit/pull/145))

- Add the Charges tab to `ItemBrowser`; `FilterToggle` takes `typeId` ([#156](https://github.com/EVEShipFit/eveship.fit/pull/156))

- Add resistances and a repair rate picker to `DefenseStats`, and `ResistanceBar` ([#144](https://github.com/EVEShipFit/eveship.fit/pull/144))

- Drag and drop modules on `FittingWheel` ([#154](https://github.com/EVEShipFit/eveship.fit/pull/154))

- Drop a charge on a module of `FittingWheel` to load it ([#156](https://github.com/EVEShipFit/eveship.fit/pull/156))

- Hover a module on the `FittingWheel` to unfit it, remove its charge, or put it online or offline ([#139](https://github.com/EVEShipFit/eveship.fit/pull/139))

- The `FittingWheel` is as big as EVE's at the UI scale in `--esf-scale`, 100% by default, and draws module icons as big as EVE does ([#140](https://github.com/EVEShipFit/eveship.fit/pull/140))

- Click a module on the `FittingWheel` to switch it to its next state, or shift-click for the one before; `WheelSlot` takes an `onPress` to become a button ([#135](https://github.com/EVEShipFit/eveship.fit/pull/135))

- Add `FittingWheel`: the fitting wheel of the fit in the surrounding `EveShipFitProvider` ([#134](https://github.com/EVEShipFit/eveship.fit/pull/134))

- Add `FittingWindow`: EVE's fitting window around the `FittingWheel`; and `HistoryBar` ([#142](https://github.com/EVEShipFit/eveship.fit/pull/142))

- Add EVE's filters and Simulate Ship to the Hulls & Fits tab of `ItemBrowser`, and `FilterToggle`; `TreeLeaf` now puts `after` beside its row, not in it ([#149](https://github.com/EVEShipFit/eveship.fit/pull/149))

- Show browser-saved fits under their hull in `ItemBrowser`; `TreeGroup` takes `typeId`, `description` and `after` ([#151](https://github.com/EVEShipFit/eveship.fit/pull/151))

- Show empire logos in Hulls & Fits ([#152](https://github.com/EVEShipFit/eveship.fit/pull/152))

- Add `ItemBrowser`, EVE's browser left of the wheel with its Hulls & Fits tab, which `FittingWindow` slides out as `browser`, and size `TreeList` by EVE's UI scale ([#148](https://github.com/EVEShipFit/eveship.fit/pull/148))

- Preview a hovered module in `FittingWheel`; a double click fits it ([#153](https://github.com/EVEShipFit/eveship.fit/pull/153))

- Add the Modules tab to `ItemBrowser` ([#152](https://github.com/EVEShipFit/eveship.fit/pull/152))

- Add `ShipStatistics`, which the `FittingWindow` slides out with its Statistics button ([#143](https://github.com/EVEShipFit/eveship.fit/pull/143))

- The Skills filter of `ItemBrowser`'s Hulls & Fits tab keeps the hulls the character can fly ([#150](https://github.com/EVEShipFit/eveship.fit/pull/150))

- The statistics show EVE's tooltips of their attributes, which need a `TextsProvider`; add `TooltipText`, and `tooltip` to `Stat` ([#146](https://github.com/EVEShipFit/eveship.fit/pull/146))

- Add `Tooltip`: a label above an element while it is hovered or has keyboard focus, like EVE's ([#138](https://github.com/EVEShipFit/eveship.fit/pull/138))

### Patch Changes

- Colour only the free CPU and power grid in a preview ([#157](https://github.com/EVEShipFit/eveship.fit/pull/157))

- Colour CPU and power grid in a preview ([#155](https://github.com/EVEShipFit/eveship.fit/pull/155))
- Updated dependencies [[`4a93066`](https://github.com/EVEShipFit/eveship.fit/commit/4a9306648a5a5ca2ebf947cbb368100df6e61f2a), [`dbd8d25`](https://github.com/EVEShipFit/eveship.fit/commit/dbd8d25761ff437b9072e04d29418231c64f3dde), [`8393231`](https://github.com/EVEShipFit/eveship.fit/commit/83932314911a0e36bbdc6d4a0dc809435e558592), [`7d8f133`](https://github.com/EVEShipFit/eveship.fit/commit/7d8f1338fb392600ca329f23949efdf77d23c65f), [`9b3e8c2`](https://github.com/EVEShipFit/eveship.fit/commit/9b3e8c2277bc1d89ff85f75077f6de350ec25fc2), [`22074fe`](https://github.com/EVEShipFit/eveship.fit/commit/22074fe43ed39e5464d8c5bf0b6d75d6f39287e2), [`2645240`](https://github.com/EVEShipFit/eveship.fit/commit/2645240608d9e0620598bcfed1464c57cab7ef22), [`badc425`](https://github.com/EVEShipFit/eveship.fit/commit/badc4251364c358dc118df08a5faaf243e51d01d), [`2ffedb8`](https://github.com/EVEShipFit/eveship.fit/commit/2ffedb891ac8ecdf56bae567d34856692ac26da5), [`9efea15`](https://github.com/EVEShipFit/eveship.fit/commit/9efea15cfd282fd5ab8e3273ea4a7279c503b477)]:
  - @eveshipfit/react-hooks@1.2.0

## 1.0.0

### Major Changes

- Add ui-ingame: a dialog, a tree list and type icons in the in-game style ([#118](https://github.com/EVEShipFit/eveship.fit/pull/118))

### Minor Changes

- Add `Icon`: EVE's interface icons by name, from `@eveshipfit/images` ([#126](https://github.com/EVEShipFit/eveship.fit/pull/126))

- Draw `TypeIcon` from `@eveshipfit/images`, with its tech level or faction marker; it takes the images from the `ImagesProvider` of `@eveshipfit/react-hooks` ([#128](https://github.com/EVEShipFit/eveship.fit/pull/128))

- Add `Wheel`: the rings of EVE's fitting wheel and the scales of its gauges, from EVE's own textures, for its slots and gauges to sit on ([#120](https://github.com/EVEShipFit/eveship.fit/pull/120))

- Add `WheelGauge`: the CPU, powergrid and calibration a fit uses, as arcs on the fitting wheel ([#124](https://github.com/EVEShipFit/eveship.fit/pull/124))

- Add `WheelHardpoints`: the turret and launcher hardpoints on the fitting wheel, used and free ([#123](https://github.com/EVEShipFit/eveship.fit/pull/123))

- Add `WheelHull`: the ship's render behind the fitting wheel ([#125](https://github.com/EVEShipFit/eveship.fit/pull/125))

- Add `slotAngle` and `rackSize` to place each rack's slots on the fitting wheel, and `WheelRackMarker` for the squares in front of the racks ([#122](https://github.com/EVEShipFit/eveship.fit/pull/122))

- Add `WheelSlot`: one slot on the fitting wheel, empty or with a module and its state ([#121](https://github.com/EVEShipFit/eveship.fit/pull/121))

### Patch Changes

- Updated dependencies [[`75c2d62`](https://github.com/EVEShipFit/eveship.fit/commit/75c2d62285cba3435cd89137fb4c449dbdcebb46)]:
  - @eveshipfit/react-hooks@1.1.0
