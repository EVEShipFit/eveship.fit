import type { Decorator } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { Wheel } from "./Wheel";

export const onAWheel: Decorator = (Story, { parameters }) => (
  <div
    style={
      {
        "--esf-wheel-size": parameters.wheelSize,
        background: "#3a2a2e",
        width: "fit-content",
      } as CSSProperties
    }
  >
    <Wheel label="Fitting">{Story()}</Wheel>
  </div>
);
