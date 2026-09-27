import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TooltipText } from "../Tooltip/Tooltip";
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

export const WithTooltip: Story = {
  args: {
    tooltip: <TooltipText title="Scan Resolution" description="Larger values increase target locking speed" />,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("group", { name: "Scan Resolution" }));
    await expect(canvas.getByText("Larger values increase target locking speed")).toBeVisible();
  },
};
