import type { Engine, Fit } from "@eveshipfit/fitting";
import type { Images } from "@eveshipfit/images";
import { EveShipFitProvider } from "@eveshipfit/react-hooks";
import { ImagesProvider } from "@eveshipfit/ui-ingame";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";

import "@eveshipfit/ui-ingame/theme.css";
import "./preview.css";

import { loadEngine } from "./engine";
import { loadAllImages } from "./images";

/** Every story gets a fresh fit: `parameters.fit`, or an empty Rifter. */
const withFit: Decorator = (Story, { loaded, parameters }) => (
  <WithFit engine={loaded.engine as Engine} fit={parameters.fit}>
    <Story />
  </WithFit>
);

const withImages: Decorator = (Story, { loaded }) => (
  <ImagesProvider images={loaded.images as Images}>
    <Story />
  </ImagesProvider>
);

function WithFit({ engine, fit, children }: { engine: Engine; fit?: Fit | { ship: number }; children: ReactNode }) {
  const [store] = useState(() => engine.createFit(fit ?? { ship: 587 }));
  return (
    <EveShipFitProvider engine={engine} fit={store}>
      {children}
    </EveShipFitProvider>
  );
}

const preview: Preview = {
  loaders: [
    async () => {
      const [engine, images] = await Promise.all([loadEngine(), loadAllImages()]);
      return { engine, images };
    },
  ],
  decorators: [withFit, withImages],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
