# @eveshipfit/ui-ingame

React components for EVE Online ship fitting that look like the in-game UI.

Part of [EVEShip.fit](https://eveship.fit).

## Install

```sh
npm install @eveshipfit/ui-ingame react react-dom
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

Every colour and size is a CSS variable in `theme.css`; override them, or load your own theme instead.

Type icons load from `https://images.evetech.net`.

## License

MIT
