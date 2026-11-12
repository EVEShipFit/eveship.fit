import type { Images } from "@eveshipfit/images";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/noto-sans";
import "@eveshipfit/ui-ingame/theme.css";
import "./global.css";

import { App } from "./App";
import { createEsi, loadData, loadGame, type Data } from "./data";

const root = createRoot(document.getElementById("root")!);
const loaded: { data?: Data | null; images?: Images } = {};
const render = () =>
  root.render(
    <StrictMode>
      <App data={loaded.data} images={loaded.images} />
    </StrictMode>,
  );

render();
const esi = createEsi();
const game = loadGame(esi);
game.images.then(
  (images) => {
    loaded.images = images;
    render();
  },
  () => {},
);
void loadData(esi, game).then((data) => {
  loaded.data = data;
  render();
});
