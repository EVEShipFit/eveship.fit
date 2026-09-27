import type { Character, Engine, Fit } from "@eveshipfit/fitting";
import type { Images } from "@eveshipfit/images";
import { EveShipFitProvider, ImagesProvider } from "@eveshipfit/react-hooks";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";

import "@eveshipfit/ui-ingame/theme.css";
import "./preview.css";

import { loadEngine } from "./engine";
import { loadAllImages } from "./images";

/** Every story gets a fresh fit: `parameters.fit`, or an empty Rifter, flown by `parameters.character`. */
const withFit: Decorator = (Story, { loaded, parameters }) => (
  <WithFit engine={loaded.engine as Engine} fit={parameters.fit} character={parameters.character}>
    <Story />
  </WithFit>
);

const withImages: Decorator = (Story, { loaded }) => (
  <ImagesProvider images={loaded.images as Images}>
    <Story />
  </ImagesProvider>
);

interface WithFitProps {
  engine: Engine;
  fit?: Fit | { ship: number };
  character?: Character;
  children: ReactNode;
}

function WithFit({ engine, fit, character, children }: WithFitProps) {
  const [store] = useState(() => engine.createFit(fit ?? { ship: 587 }, character));
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
