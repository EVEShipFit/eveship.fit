import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelHull } from "./WheelHull";

const meta = {
  component: WheelHull,
  args: { typeId: 587 },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelHull>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rifter: Story = {
  play: async ({ canvasElement }) => {
    const hull = canvasElement.querySelector("img");
    await expect(hull).toHaveAttribute("src", "https://images.evetech.net/types/587/render?size=1024");
    // Under the rings, so the rings stay on top.
    await expect(getComputedStyle(hull!).zIndex).toBe("-1");
  },
};

export const Raven: Story = {
  args: { typeId: 638 },
};

export const Small: Story = {
  parameters: { wheelSize: "240px" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(240);
  },
};
