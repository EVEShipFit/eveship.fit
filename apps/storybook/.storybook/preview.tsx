import type { Character, Engine, Fit } from "@eveshipfit/fitting";
import type { Images } from "@eveshipfit/images";
import { EveShipFitProvider, ImagesProvider, LocalFits, TextsProvider } from "@eveshipfit/react-hooks";
import type { Texts } from "@eveshipfit/sde-loader";
import type { Decorator, Preview } from "@storybook/react-vite";
import { IDBFactory } from "fake-indexeddb";
import { useState, type ReactNode } from "react";

import "@eveshipfit/ui-ingame/theme.css";
import "./preview.css";

import { loadEngine } from "./engine";
import { loadAllImages } from "./images";
import { loadAllTexts } from "./texts";

/** Every story gets a fresh fit (`parameters.fit`, or an empty Rifter), `parameters.character` and `parameters.localFits`. */
const withFit: Decorator = (Story, { loaded, parameters }) => (
  <WithFit
    engine={loaded.engine as Engine}
    fit={parameters.fit}
    character={parameters.character}
    localFits={parameters.localFits}
  >
    <Story />
  </WithFit>
);

const withImages: Decorator = (Story, { loaded }) => (
  <ImagesProvider images={loaded.images as Images}>
    <Story />
  </ImagesProvider>
);

const withTexts: Decorator = (Story, { loaded }) => (
  <TextsProvider texts={loaded.texts as Texts}>
    <Story />
  </TextsProvider>
);

interface WithFitProps {
  engine: Engine;
  fit?: Fit | { ship: number };
  character?: Character;
  localFits?: Fit[];
  children: ReactNode;
}

function WithFit({ engine, fit, character, localFits = [], children }: WithFitProps) {
  const [store] = useState(() => engine.createFit(fit ?? { ship: 587 }, character));
  const [saved] = useState(() => {
    const fits = new LocalFits({ factory: new IDBFactory(), name: crypto.randomUUID() });
    for (const one of localFits) void fits.save(one);
    return fits;
  });
  return (
    <EveShipFitProvider engine={engine} fit={store} localFits={saved}>
      {children}
    </EveShipFitProvider>
  );
}

const preview: Preview = {
  loaders: [
    async () => {
      const [engine, images, texts] = await Promise.all([loadEngine(), loadAllImages(), loadAllTexts()]);
      return { engine, images, texts };
    },
  ],
  decorators: [withFit, withImages, withTexts],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
