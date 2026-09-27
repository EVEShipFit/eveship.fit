import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DroneStats } from "./DroneStats";

const types = {
  Tristan: 593,
  "Hobgoblin II": 2456,
};

const meta = {
  component: DroneStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof DroneStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoDrones: Story = {
  parameters: { fit: { ship: types.Tristan } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Drones/ })).toHaveTextContent("0.0 dps");
    await expect(canvas.getByRole("group", { name: "Drone Bandwidth" })).toHaveTextContent("0/25 Mbit/sec");
    await expect(canvas.getByRole("group", { name: "Drone Control Range" })).toHaveTextContent("60.00 km");
    await expect(canvas.getByRole("group", { name: "Active Drones" })).toHaveTextContent("0 Active");
  },
};

export const TwoHobgoblins: Story = {
  parameters: {
    fit: {
      ship: { type_id: types.Tristan },
      items: [{ type_id: types["Hobgoblin II"], slot: { type: "drone_bay" }, quantity: 2, state: "active" }],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Drones/ })).toHaveTextContent("39.6 dps");
    await expect(canvas.getByRole("group", { name: "Drone Bandwidth" })).toHaveTextContent("10/25 Mbit/sec");
    await expect(canvas.getByRole("group", { name: "Active Drones" })).toHaveTextContent("2 Active");
  },
};
