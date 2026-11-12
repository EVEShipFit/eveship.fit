import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FittingWindowLoading } from "./FittingWindow";

const meta = {
  component: FittingWindowLoading,
  args: { text: "Loading ships…" },
} satisfies Meta<typeof FittingWindowLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  play: async ({ canvas }) => {
    const { width, height } = canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect();
    await expect(width).toBe(708);
    await expect(height).toBe(694);
    await expect(canvas.getByRole("region", { name: "Fitting" })).toBeInTheDocument();
    await expect(canvas.getByText("Loading ships…")).toBeInTheDocument();
  },
};

/** As wide as the `FittingWindow` with its browser and statistics slid out. */
export const WithRoom: Story = {
  args: { browser: true, statistics: true },
  play: async ({ canvas }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect();
    const wheel = canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect();
    await expect(window.width).toBe(1380);
    await expect(wheel.left - window.left).toBe(468);
    await expect(wheel.top - window.top).toBe(29);
  },
};
