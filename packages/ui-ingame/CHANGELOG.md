# @eveshipfit/ui-ingame

## 1.11.0

### Minor Changes

- Right-click menus on modules, implants, boosters, the hull, items in the item browser, hulls and saved fits ([#314](https://github.com/EVEShipFit/eveship.fit/pull/314))

- Hovering the Simulation History previews that fit ([#308](https://github.com/EVEShipFit/eveship.fit/pull/308))

- Add `pasteToOpen` to `ItemBrowser`: paste a fit anywhere on the page to open it ([#310](https://github.com/EVEShipFit/eveship.fit/pull/310))

- Show a ship's bonuses when hovering its picture in the hull list, or the Show Info button of the fit ([#316](https://github.com/EVEShipFit/eveship.fit/pull/316))

- Scroll an open tooltip with the wheel, when its label is too long to show at once ([#316](https://github.com/EVEShipFit/eveship.fit/pull/316))

### Patch Changes

- Hovering the fit's price lists what it adds up ([#309](https://github.com/EVEShipFit/eveship.fit/pull/309))

- Hulls & Fits says "No hulls found" when nothing matches ([#298](https://github.com/EVEShipFit/eveship.fit/pull/298))

- The item browser refuses a module without a free slot, or a charge no fitted module loads, and the wheel says so ([#307](https://github.com/EVEShipFit/eveship.fit/pull/307))

- The buttons over a hovered slot are equally sharp ([#303](https://github.com/EVEShipFit/eveship.fit/pull/303))

- Make the statistics section headers stand out ([#305](https://github.com/EVEShipFit/eveship.fit/pull/305))

- Line up the tooltip's border with its notch ([#302](https://github.com/EVEShipFit/eveship.fit/pull/302))

- Wrap a long tooltip inside something that does not wrap ([#316](https://github.com/EVEShipFit/eveship.fit/pull/316))
- Updated dependencies [[`d805b5c`](https://github.com/EVEShipFit/eveship.fit/commit/d805b5c967665ca4f303f097f3621edf9b4272c2), [`8336fc4`](https://github.com/EVEShipFit/eveship.fit/commit/8336fc4aea6e90cbb8945a59a9fa73e429e6c17b), [`56b4b6a`](https://github.com/EVEShipFit/eveship.fit/commit/56b4b6a4140a48925a9cd164448cf13c7d4daff5), [`722bc02`](https://github.com/EVEShipFit/eveship.fit/commit/722bc0299b315e52617d6568667b4eb29a42cb10), [`d390b93`](https://github.com/EVEShipFit/eveship.fit/commit/d390b93c44788ef41da764236fa7bfb550dae6b5)]:
  - @eveshipfit/fitting@2.5.0
  - @eveshipfit/react-hooks@2.5.0

## 1.10.0

### Minor Changes

- `ItemBrowser` takes `noHullSelected` to turn off Save, Copy, fitting and the hull filters ([#291](https://github.com/EVEShipFit/eveship.fit/pull/291))

- Show Info on the hull, with the values on the fit ([#268](https://github.com/EVEShipFit/eveship.fit/pull/268))

### Patch Changes

- Hovering an implant or booster looks like hovering a module ([#266](https://github.com/EVEShipFit/eveship.fit/pull/266))

- Hide the actions of a previewed implant or booster slot. ([#284](https://github.com/EVEShipFit/eveship.fit/pull/284))

- Collapsing the statistics no longer makes the page scroll sideways ([#263](https://github.com/EVEShipFit/eveship.fit/pull/263))

- When the browser blocks the clipboard, Copy shows the fit to copy by hand ([#287](https://github.com/EVEShipFit/eveship.fit/pull/287))

- Dropping a charge on a module loads it again ([#273](https://github.com/EVEShipFit/eveship.fit/pull/273))

- Give items in a flat list the normal background, not the one of a group ([#267](https://github.com/EVEShipFit/eveship.fit/pull/267))

- Show a tooltip on the turret and launcher hardpoints ([#271](https://github.com/EVEShipFit/eveship.fit/pull/271))

- The wheel, the item browser and Variations refuse a module the hull cannot fit, and the wheel says so ([#292](https://github.com/EVEShipFit/eveship.fit/pull/292))

- Show only the implants when a search in By Slot finds a single slot ([#262](https://github.com/EVEShipFit/eveship.fit/pull/262))

- Import no longer crashes when the browser has no clipboard ([#289](https://github.com/EVEShipFit/eveship.fit/pull/289))

- The Item Browser no longer re-filters its tree on every hover ([#281](https://github.com/EVEShipFit/eveship.fit/pull/281))

- Screen readers name the slots of a read-only wheel ([#295](https://github.com/EVEShipFit/eveship.fit/pull/295))

- Add a Service Slot filter to the Modules tab, pressed when browsing an empty service slot. ([#290](https://github.com/EVEShipFit/eveship.fit/pull/290))

- Show the module tooltip when hovering a service slot. ([#293](https://github.com/EVEShipFit/eveship.fit/pull/293))

- Scale tooltips and dialogs with the UI scale ([#288](https://github.com/EVEShipFit/eveship.fit/pull/288))

- Drag a tree group in Firefox before 147. ([#285](https://github.com/EVEShipFit/eveship.fit/pull/285))

- Space activates a tree leaf, like Enter ([#294](https://github.com/EVEShipFit/eveship.fit/pull/294))

- Depend on @eveshipfit/fitting instead of bundling a copy ([#270](https://github.com/EVEShipFit/eveship.fit/pull/270))
- Updated dependencies [[`f522554`](https://github.com/EVEShipFit/eveship.fit/commit/f5225545ab5a12e4133ae7beb2975f0a7dd4097c), [`5287b0a`](https://github.com/EVEShipFit/eveship.fit/commit/5287b0a7f1fcd65dbaa80ae55bc5a5b3a6769e2b), [`13beee7`](https://github.com/EVEShipFit/eveship.fit/commit/13beee77af09e992478858864a4e8000b68b3450), [`719d4f4`](https://github.com/EVEShipFit/eveship.fit/commit/719d4f43d0cbdc1009a9103cebc6ef1e9d0540d5), [`e0c6f86`](https://github.com/EVEShipFit/eveship.fit/commit/e0c6f86199831dc3b71b81f55982e6a9c538c374), [`75a068f`](https://github.com/EVEShipFit/eveship.fit/commit/75a068f3209acb27da83f57c7d5db81d8cf6a529), [`ff59605`](https://github.com/EVEShipFit/eveship.fit/commit/ff596051c1297eee36e56e1a1f21bef8288d5b78), [`c4d52b0`](https://github.com/EVEShipFit/eveship.fit/commit/c4d52b09f5a1df05dbbe3f0a9d850b24a9c52ee6), [`37acfb4`](https://github.com/EVEShipFit/eveship.fit/commit/37acfb49e83d3f0e4acb85eade5fdcb69b66260c), [`91c4688`](https://github.com/EVEShipFit/eveship.fit/commit/91c4688807a0a4c42c9208ad0afd80d7b3e1d149), [`9a003be`](https://github.com/EVEShipFit/eveship.fit/commit/9a003be7f8bd1f07bc7132804f785fc23747ecc4), [`cdd4387`](https://github.com/EVEShipFit/eveship.fit/commit/cdd4387356f0a1124ac080641a3ea735b37a8b78), [`7b9be66`](https://github.com/EVEShipFit/eveship.fit/commit/7b9be668ff11140ec259c1a6b36f44691ab6c3d2)]:
  - @eveshipfit/fitting@2.4.1
  - @eveshipfit/react-hooks@2.4.0

## 1.9.0

### Minor Changes

- Show Info on fitted implants and boosters, and swap an implant for one of its variations ([#257](https://github.com/EVEShipFit/eveship.fit/pull/257))

- Walk the Item Browser with the arrow keys: Down from the search field enters the tree, Left and Right close and open groups ([#260](https://github.com/EVEShipFit/eveship.fit/pull/260))

### Patch Changes

- Point to the Character button when Personal Fittings needs a login ([#258](https://github.com/EVEShipFit/eveship.fit/pull/258))
- Updated dependencies []:
  - @eveshipfit/react-hooks@2.3.1

## 1.8.0

### Minor Changes

- Filter implants and boosters by kind and skills, list them by slot, and click an implant or booster slot to browse it ([#250](https://github.com/EVEShipFit/eveship.fit/pull/250))

- Clicking an empty slot shows the modules for that slot and hull in the item browser ([#244](https://github.com/EVEShipFit/eveship.fit/pull/244))

- Pick a damage profile for the ehp, or make your own ([#254](https://github.com/EVEShipFit/eveship.fit/pull/254))

- Copy a module by dragging it to another slot with Ctrl (⌥ on Mac) held ([#245](https://github.com/EVEShipFit/eveship.fit/pull/245))

- `FittingWindow` takes a `placeholder` to show an empty wheel with a text instead of the fit, and `FitStore.clearHistory()` forgets all but the current fit ([#251](https://github.com/EVEShipFit/eveship.fit/pull/251))

- Show Info has a Variations tab; on a fitted item, hovering one previews it, and double clicking fits it instead ([#255](https://github.com/EVEShipFit/eveship.fit/pull/255))

- Show Info on a module, charge or other item shows its attributes next to it, on the fit when fitted ([#248](https://github.com/EVEShipFit/eveship.fit/pull/248))

- Hovering a type in the item browser shows its name and estimated price ([#249](https://github.com/EVEShipFit/eveship.fit/pull/249))

### Patch Changes

- Hide a slot's actions while dragging a module ([#247](https://github.com/EVEShipFit/eveship.fit/pull/247))

- Simulation History entries have even gaps at any UI scale ([#252](https://github.com/EVEShipFit/eveship.fit/pull/252))

- Keep a slot's actions open across the full width of the slot ([#253](https://github.com/EVEShipFit/eveship.fit/pull/253))
- Updated dependencies [[`3fc613e`](https://github.com/EVEShipFit/eveship.fit/commit/3fc613e535c343b519d11666506912ba5c22e08b), [`e2f6552`](https://github.com/EVEShipFit/eveship.fit/commit/e2f6552b270b78e95940b6ec7e1d10e81e1eb868), [`48a5524`](https://github.com/EVEShipFit/eveship.fit/commit/48a552406d21adf612160aba1cb9795d70135712), [`b1d5ae3`](https://github.com/EVEShipFit/eveship.fit/commit/b1d5ae33ba3778a8514a4219a14c9cfcb8972ba9), [`e09a861`](https://github.com/EVEShipFit/eveship.fit/commit/e09a86169750542062ab0401ba38121519ca39f9), [`8c71b4c`](https://github.com/EVEShipFit/eveship.fit/commit/8c71b4c614f20ebc881a5e3ab554fc9dea1d8950)]:
  - @eveshipfit/react-hooks@2.3.0

## 1.7.0

### Minor Changes

- Add implants and boosters to the fitting wheel, and an Implants tab to the item browser ([#242](https://github.com/EVEShipFit/eveship.fit/pull/242))

### Patch Changes

- Space the statistics as far from the fitting wheel as the item browser ([#242](https://github.com/EVEShipFit/eveship.fit/pull/242))
- Updated dependencies [[`25d67af`](https://github.com/EVEShipFit/eveship.fit/commit/25d67af9a312533dd5cfd93bbeac1b117a87c061)]:
  - @eveshipfit/react-hooks@2.2.0

## 1.6.0

### Minor Changes

- Show the stats of warp disruption, electronic warfare and sensor modules in their tooltip ([#219](https://github.com/EVEShipFit/eveship.fit/pull/219))

- Show the stats of drones and fighters in their tooltip ([#229](https://github.com/EVEShipFit/eveship.fit/pull/229))

- Show the stats of tracking computers, tractor beams, smartbombs and more remote modules in their tooltip ([#217](https://github.com/EVEShipFit/eveship.fit/pull/217))

- Add `preview` to `FittingWindow`, which shows the fit without its name, warnings, history or anything to change it, and `actions` to `ServiceSlot` ([#237](https://github.com/EVEShipFit/eveship.fit/pull/237))

- Show the stats of mining, command burst, scanning, cloaking and compression modules in their tooltip ([#220](https://github.com/EVEShipFit/eveship.fit/pull/220))

- Show the stats of more modules in their tooltip ([#215](https://github.com/EVEShipFit/eveship.fit/pull/215))

- Show the stats of remote repairers, hull repairers, remote sensor boosters and remote tracking computers in their tooltip ([#216](https://github.com/EVEShipFit/eveship.fit/pull/216))

### Patch Changes

- Show how many charges are loaded in the tooltip of a module ([#213](https://github.com/EVEShipFit/eveship.fit/pull/213))

- Show the stats of normal cloaks and Emergency Hull Energizers in their tooltip ([#227](https://github.com/EVEShipFit/eveship.fit/pull/227))

- Drag items out of the cargo, drone bay and fighter bay onto the ship ([#223](https://github.com/EVEShipFit/eveship.fit/pull/223))

- Match the tooltips of drones, fighters, subsystems, charges and a few more modules to the game ([#236](https://github.com/EVEShipFit/eveship.fit/pull/236))

- Start up faster: find skills and modes without reading every type, and render hidden item browser tabs after the rest ([#240](https://github.com/EVEShipFit/eveship.fit/pull/240))

- Show the fit sooner: find charges by their groups, and fill the item browser after the rest ([#241](https://github.com/EVEShipFit/eveship.fit/pull/241))

- Sort fits by name in Hulls & Fits, and keep the current hull under the fit filters ([#234](https://github.com/EVEShipFit/eveship.fit/pull/234))

- Show the stats of doomsdays, breacher pod launchers, vorton projectors and more in their tooltip ([#228](https://github.com/EVEShipFit/eveship.fit/pull/228))

- Match the tooltips of special launchers, grapplers, point defense and modulated miners to the game ([#235](https://github.com/EVEShipFit/eveship.fit/pull/235))

- Drag a squadron to another fighter tube, swapping it with what is there ([#225](https://github.com/EVEShipFit/eveship.fit/pull/225))

- Show ranges below 10 km in meters in the tooltip of a module ([#218](https://github.com/EVEShipFit/eveship.fit/pull/218))

- Read the range of a module from its effect in its tooltip ([#238](https://github.com/EVEShipFit/eveship.fit/pull/238))

- Show the stats of structure modules in their tooltip ([#231](https://github.com/EVEShipFit/eveship.fit/pull/231))

- Show module tooltips more like the game does ([#230](https://github.com/EVEShipFit/eveship.fit/pull/230))

- Show an "Open on eveship.fit" link on the fitting wheel when not on eveship.fit ([#224](https://github.com/EVEShipFit/eveship.fit/pull/224))
- Updated dependencies [[`a9b0d40`](https://github.com/EVEShipFit/eveship.fit/commit/a9b0d40b7c1d7eaa730f3be8c316799b9e7ee872)]:
  - @eveshipfit/react-hooks@2.1.1

## 1.5.0

### Minor Changes

- Show the fittings of the logged-in character under Personal Fittings ([#199](https://github.com/EVEShipFit/eveship.fit/pull/199))

- Add Save, Import and Copy buttons under the `ItemBrowser` ([#195](https://github.com/EVEShipFit/eveship.fit/pull/195))

- Show just the fit with `<FittingWheel readOnly />`, and leave out its gauges with `hideStats` ([#202](https://github.com/EVEShipFit/eveship.fit/pull/202))

- Show a tooltip with the module, its charge and its state when hovering a slot of the fitting wheel ([#208](https://github.com/EVEShipFit/eveship.fit/pull/208))

- Show the max velocity in the tooltip of a microwarpdrive or afterburner ([#210](https://github.com/EVEShipFit/eveship.fit/pull/210))

- Rename the fit by clicking its name, and ask for a name when saving a fit without one ([#197](https://github.com/EVEShipFit/eveship.fit/pull/197))

- Show the resistance bonus in the tooltip of a hardener, amplifier, coating or membrane ([#211](https://github.com/EVEShipFit/eveship.fit/pull/211))

- Switch the mode of a tactical destroyer or Anhinga on the fitting wheel ([#207](https://github.com/EVEShipFit/eveship.fit/pull/207))

- Show range, damage and tracking in the tooltip of a turret ([#212](https://github.com/EVEShipFit/eveship.fit/pull/212))

### Patch Changes

- Load fits from DNA, in `loadText` and as a `dna:` link, and require `@eveshipfit/dogma-engine` 13.4.0 ([#206](https://github.com/EVEShipFit/eveship.fit/pull/206))

- Show drone bandwidth in red when over the limit ([#205](https://github.com/EVEShipFit/eveship.fit/pull/205))

- Load a fit in Hulls & Fits with a single click ([#200](https://github.com/EVEShipFit/eveship.fit/pull/200))

- Hide the fitting gauges until their texture is loaded ([#194](https://github.com/EVEShipFit/eveship.fit/pull/194))

- Use Noto Sans as the default font ([#201](https://github.com/EVEShipFit/eveship.fit/pull/201))

- Set an imported EFT or ESI fit to the states EVE gives it ([#204](https://github.com/EVEShipFit/eveship.fit/pull/204))

- Put rigs offline and back online on the fitting wheel, and require `@eveshipfit/dogma-engine` 13.5.0 ([#209](https://github.com/EVEShipFit/eveship.fit/pull/209))
- Updated dependencies [[`bf94f16`](https://github.com/EVEShipFit/eveship.fit/commit/bf94f1637c90c987517ec27e3f56537a124f75d4), [`1d62f20`](https://github.com/EVEShipFit/eveship.fit/commit/1d62f20580bb837e34f886d1b8d8849dea7f455c), [`0dd12de`](https://github.com/EVEShipFit/eveship.fit/commit/0dd12de0baf887771615a1c29addd345247b6ed8), [`9c446d6`](https://github.com/EVEShipFit/eveship.fit/commit/9c446d6a53091d739a846f0643f302e54ce9034d), [`3970335`](https://github.com/EVEShipFit/eveship.fit/commit/3970335be9da0aeca645b928656167ff5e122945), [`d59db39`](https://github.com/EVEShipFit/eveship.fit/commit/d59db39904b94227efa7ed205b8db86a59470276), [`e106f8a`](https://github.com/EVEShipFit/eveship.fit/commit/e106f8ab312bcbe64cd126e1aff6771bf10ea150)]:
  - @eveshipfit/react-hooks@2.1.0

## 1.4.0

### Minor Changes

- Drag a hull from the `ItemBrowser` to the middle of the fitting wheel to simulate it ([#177](https://github.com/EVEShipFit/eveship.fit/pull/177))

- Add the fighter bay to `FittingWindow`, with its tubes, for carriers and structures; Manage in `ShipStatistics` opens it ([#179](https://github.com/EVEShipFit/eveship.fit/pull/179))

- Show the fit's estimated price in `ShipStatistics` when the engine has an `esi` ([#182](https://github.com/EVEShipFit/eveship.fit/pull/182))

### Patch Changes

- Round stats the way EVE's fitting window does, and drop `roundingOf` ([#180](https://github.com/EVEShipFit/eveship.fit/pull/180))
- Updated dependencies [[`4df832a`](https://github.com/EVEShipFit/eveship.fit/commit/4df832ae816fa18a4301437da02bca95c812d508), [`6f9ad6d`](https://github.com/EVEShipFit/eveship.fit/commit/6f9ad6da7c7c85f76f098d25818bc9c7b9be07af), [`1ae802c`](https://github.com/EVEShipFit/eveship.fit/commit/1ae802c6695613aabc60e6e70ab5d720acbc3ec8), [`114f043`](https://github.com/EVEShipFit/eveship.fit/commit/114f043ac89f032d5fc8be978686440e3b920301)]:
  - @eveshipfit/react-hooks@2.0.0

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
