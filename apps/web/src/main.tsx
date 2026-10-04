import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/noto-sans";
import "@eveshipfit/ui-ingame/theme.css";
import "./global.css";

import { App } from "./App";
import { loadData } from "./data";

const data = loadData();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App data={data} />
  </StrictMode>,
);
