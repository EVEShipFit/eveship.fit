import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelGauge } from "./WheelGauge";

const meta = {
  component: WheelGauge,
  args: { resource: "cpu", used: 61.3, total: 162.5, valueText: "61.3 of 162.5 tf" },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cpu: Story = {
  play: async ({ canvas }) => {
    const gauge = canvas.getByRole("meter", { name: "CPU" });
    await expect(gauge).toHaveAttribute("aria-valuetext", "61.3 of 162.5 tf");
    await expect(gauge).not.toHaveAttribute("data-over");
  },
};

export const Powergrid: Story = {
  args: { resource: "powergrid", used: 27.1, total: 51.3, valueText: "27.1 of 51.3 MW" },
};

export const Calibration: Story = {
  args: { resource: "calibration", used: 100, total: 400, valueText: "100 of 400" },
};

export const Unused: Story = {
  args: { used: 0 },
};

export const Full: Story = {
  args: { used: 162.5 },
};

/** More used than the ship has: the arc stops at full, and turns red. */
export const Over: Story = {
  args: { used: 180 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("meter", { name: "CPU" })).toHaveAttribute("data-over", "true");
  },
};

/** A ship without calibration, like a shuttle: nothing to fill. */
export const NoneToUse: Story = {
  args: { resource: "calibration", used: 0, total: 0 },
};

export const AllThree: Story = {
  render: () => (
    <>
      <WheelGauge resource="cpu" used={61.3} total={162.5} />
      <WheelGauge resource="powergrid" used={27.1} total={51.3} />
      <WheelGauge resource="calibration" used={100} total={400} />
    </>
  ),
};
