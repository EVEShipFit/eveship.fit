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

export const Tooltips: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const turrets = canvas.getByText(/gunnery and mining turrets/);
    await expect(turrets).not.toBeVisible();
    await userEvent.hover(canvasElement.querySelector('[data-icon="hardpoint-turret"]')!);
    await expect(turrets).toBeVisible();
    await expect(canvas.getByText("2 / 3")).toBeVisible();

    await userEvent.hover(canvasElement.querySelector('[data-icon="hardpoint-launcher"]')!);
    await expect(canvas.getByText(/missile launcher modules/)).toBeVisible();
    await expect(canvas.getByText("0 / 2")).toBeVisible();
  },
};

export const None: Story = {
  args: { turrets: { used: 0, total: 0 }, launchers: { used: 0, total: 0 } },
};

export const AllUsed: Story = {
  args: { turrets: { used: 8, total: 8 }, launchers: { used: 8, total: 8 } },
};

export const TooMany: Story = {
  args: { turrets: { used: 5, total: 3 }, launchers: { used: 1, total: 0 } },
};
