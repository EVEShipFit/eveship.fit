# @eveshipfit/ui-ingame

React components for EVE Online ship fitting that look like the in-game UI.

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/ui-ingame @eveshipfit/images react react-dom
```

## Usage

Load the theme once, then use the components:

```tsx
import "@eveshipfit/ui-ingame/theme.css";
import { TreeLeaf, TreeList } from "@eveshipfit/ui-ingame";

<TreeList label="Ships">
  <TreeLeaf label="Rifter" typeId={587} onActivate={() => console.log("Rifter")} />
</TreeList>;
```

Every colour and size is a CSS variable in `theme.css`; override them, or load your own theme instead. `--esf-scale` is
EVE's UI scale, `1` for 100%; the `FittingWindow`, `FittingWheel`, `ShipStatistics` and `HistoryBar` are as big as EVE's
at that scale.

Give the `FittingWindow` its statistics to get the button that slides them out: `<FittingWindow statistics={<ShipStatistics />} />`.

Icons are drawn from `@eveshipfit/images`: put the components inside an `ImagesProvider` of
`@eveshipfit/react-hooks`. The tooltips of `ShipStatistics` come from `texts.dat` of `@eveshipfit/sde`: put it inside a
`TextsProvider` too.

## License

MIT
