import type { Decorator } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { Wheel } from "./Wheel";

/** For stories: puts the story on a large `Wheel`, over a background the rings show on. */
export const onAWheel: Decorator = (Story) => (
  <div style={{ "--esf-wheel-size": "730px", background: "#3a2a2e", width: "fit-content" } as CSSProperties}>
    <Wheel label="Fitting">{Story()}</Wheel>
  </div>
);
