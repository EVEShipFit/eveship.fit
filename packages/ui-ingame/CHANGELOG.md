# @eveshipfit/ui-ingame

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
