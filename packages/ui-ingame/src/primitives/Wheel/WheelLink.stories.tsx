import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelLink } from "./WheelLink";

const meta = {
  component: WheelLink,
  args: { href: "https://eveship.fit/", text: "Open on eveship.fit" },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenOnEveShipFit: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Open on eveship.fit" })).toHaveAttribute(
      "href",
      "https://eveship.fit/",
    );
  },
};
