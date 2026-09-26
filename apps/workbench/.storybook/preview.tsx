import type { Engine, Fit } from "@eveshipfit/fitting";
import { EveShipFitProvider } from "@eveshipfit/react-hooks";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";

import { loadEngine } from "./engine";

/** Every story gets a fresh fit: `parameters.fit`, or an empty Rifter. */
const withFit: Decorator = (Story, { loaded, parameters }) => (
  <WithFit engine={loaded.engine as Engine} fit={parameters.fit}>
    <Story />
  </WithFit>
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
  loaders: [async () => ({ engine: await loadEngine() })],
  decorators: [withFit],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
