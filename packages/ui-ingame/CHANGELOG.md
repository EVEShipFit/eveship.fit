# @eveshipfit/ui-ingame

## 1.3.0

### Minor Changes

- Add `tooltipTitle` to `HistoryBar` ([#173](https://github.com/EVEShipFit/eveship.fit/pull/173))

- Show hitpoints above 100,000 in millions and above 100 million in billions ([#173](https://github.com/EVEShipFit/eveship.fit/pull/173))

- Show structures in the Hulls & Fits tab of the `ItemBrowser`, and sort hulls by meta as modules are ([#175](https://github.com/EVEShipFit/eveship.fit/pull/175))

- Show structures as EVE does: a taller `FittingWindow` with service slots, ammo hold and fighter bay, and Fighters and Fuel in `ShipStatistics` ([#173](https://github.com/EVEShipFit/eveship.fit/pull/173))

- Show what is wrong when hovering the fitting errors, warnings and missing skills of `FittingWindow` ([#171](https://github.com/EVEShipFit/eveship.fit/pull/171))

### Patch Changes

- Updated dependencies [[`a76a21d`](https://github.com/EVEShipFit/eveship.fit/commit/a76a21db5a51bec86a2aaf5b6f495fc2ff995aaa), [`bb8232c`](https://github.com/EVEShipFit/eveship.fit/commit/bb8232cc0823bb4b8abe4ac3c5c236c0be614f53)]:
  - @eveshipfit/react-hooks@1.4.0

## 1.2.0

### Minor Changes

- Click the cargo hold of `FittingWindow` to list what is in it, change how many, and remove it ([#161](https://github.com/EVEShipFit/eveship.fit/pull/161))

- Click the drone bay of `FittingWindow` to pick active drones, change how many, and remove them ([#162](https://github.com/EVEShipFit/eveship.fit/pull/162))

- Drop anything on the cargo hold of `FittingWindow`, and drones on its drone bay ([#164](https://github.com/EVEShipFit/eveship.fit/pull/164))

- Search in the Modules and Charges tabs of `ItemBrowser` groups results by root market group, and opens no groups, as EVE does ([#165](https://github.com/EVEShipFit/eveship.fit/pull/165))

### Patch Changes

- Match EVE's margins around the FittingWindow ([#159](https://github.com/EVEShipFit/eveship.fit/pull/159))

- Show "No Item" under a hull without fits in `ItemBrowser` ([#166](https://github.com/EVEShipFit/eveship.fit/pull/166))

- Show EVE's coloured empire logos in the Hulls & Fits tab of `ItemBrowser`, and the Ships icon for Non-Empire ([#169](https://github.com/EVEShipFit/eveship.fit/pull/169))

- Keep the groups of Hulls & Fits in `ItemBrowser` closed on search and Current Hull ([#167](https://github.com/EVEShipFit/eveship.fit/pull/167))

- `ItemBrowser` shows a folder for a market group without an icon of its own ([#168](https://github.com/EVEShipFit/eveship.fit/pull/168))

- Centre the resistance text vertically in every font ([#158](https://github.com/EVEShipFit/eveship.fit/pull/158))

- Show a tooltip on the CPU and power grid of `FittingWindow` ([#163](https://github.com/EVEShipFit/eveship.fit/pull/163))

- Fix `Tooltip` throwing when a closing popover gives it focus ([#161](https://github.com/EVEShipFit/eveship.fit/pull/161))
- Updated dependencies [[`4acc8e3`](https://github.com/EVEShipFit/eveship.fit/commit/4acc8e351d6592a7f7d32170ecac2507d07cb5d7), [`afc982f`](https://github.com/EVEShipFit/eveship.fit/commit/afc982fa78202950eb5c91fba7dd3e5f55b68c4d), [`aab4579`](https://github.com/EVEShipFit/eveship.fit/commit/aab45798762874183375a639b10a6ce0f83cad9a), [`a2bb26f`](https://github.com/EVEShipFit/eveship.fit/commit/a2bb26f5e73db35ed87255caf8b357f60ec8ec4b)]:
  - @eveshipfit/react-hooks@1.3.0

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
