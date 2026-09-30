import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TargetingStats } from "./TargetingStats";

const meta = {
  component: TargetingStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof TargetingStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Targeting/ })).toHaveTextContent("28.13 km");
    const sensor = canvas.getByRole("group", { name: "Sensor Strength" });
    await expect(sensor).toHaveTextContent("9.60 points");
    await expect(sensor.querySelector("img")).toHaveAttribute("data-icon", "stat-sensor-minmatar");
    await expect(canvas.getByRole("group", { name: "Scan Resolution" })).toHaveTextContent("825 mm");
    await expect(canvas.getByRole("group", { name: "Signature Radius" })).toHaveTextContent("35 m");
    await expect(canvas.getByRole("group", { name: "Maximum Locked Targets" })).toHaveTextContent("4x");
  },
};

export const CaldariSensors: Story = {
  parameters: { fit: { ship: 603 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Sensor Strength" }).querySelector("img")).toHaveAttribute(
      "data-icon",
      "stat-sensor-caldari",
    );
  },
};

/** The tooltip is EVE's, of the sensor shown. */
export const SensorTooltip: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("group", { name: "Sensor Strength" }));
    await expect(canvas.getByText("Ladar Sensor Strength")).toBeVisible();
    await expect(
      canvas.getByText(
        "Larger values reduce the chance of being jammed by ECM and assist in avoiding detection by probes",
      ),
    ).toBeVisible();
  },
};
