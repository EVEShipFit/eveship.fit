import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelHardpoints } from "./WheelHardpoints";

const meta = {
  component: WheelHardpoints,
  args: { turrets: { used: 2, total: 3 }, launchers: { used: 0, total: 2 } },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelHardpoints>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rifter: Story = {
  play: async ({ canvas }) => {
    const hardpoints = canvas.getByRole("img", { name: /^Turret hardpoints: 2 of 3 used/ });
    await expect(hardpoints.querySelectorAll("img")).toHaveLength(5);
    await expect(hardpoints.querySelectorAll("img[data-used]")).toHaveLength(2);
  },
};

export const None: Story = {
  args: { turrets: { used: 0, total: 0 }, launchers: { used: 0, total: 0 } },
};

export const AllUsed: Story = {
  args: { turrets: { used: 8, total: 8 }, launchers: { used: 8, total: 8 } },
};

/** More fitted than the ship has hardpoints for; only the hardpoints it has are drawn. */
export const TooMany: Story = {
  args: { turrets: { used: 5, total: 3 }, launchers: { used: 1, total: 0 } },
};
