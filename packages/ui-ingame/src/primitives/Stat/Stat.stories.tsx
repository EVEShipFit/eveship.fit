import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Stat } from "./Stat";

const meta = {
  component: Stat,
  args: { icon: "stat-scan-resolution", label: "Scan Resolution", children: "525 mm" },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Scan Resolution" })).toHaveTextContent("525 mm");
  },
};

export const WithoutIcon: Story = {
  args: { icon: undefined, label: "Active Drones", children: "0 Active" },
};
