import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/noto-sans";
import "@eveshipfit/ui-ingame/theme.css";
import "./global.css";

import { App } from "./App";
import { loadData, type Data } from "./data";

const root = createRoot(document.getElementById("root")!);
const render = (data?: Data | null) =>
  root.render(
    <StrictMode>
      <App data={data} />
    </StrictMode>,
  );

render();
void loadData().then(render);
