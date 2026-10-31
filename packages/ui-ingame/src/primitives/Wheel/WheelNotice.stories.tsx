import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelNotice } from "./WheelNotice";

const meta = {
  component: WheelNotice,
  args: { text: "Hull cannot fit this module type" },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HullCannotFit: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Hull cannot fit this module type")).toBeInTheDocument();
  },
};
