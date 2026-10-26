import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelHint } from "./WheelHint";

const meta = {
  component: WheelHint,
  args: { text: "hold Ctrl to copy" },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelHint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HoldToCopy: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("hold Ctrl to copy")).toBeInTheDocument();
  },
};
