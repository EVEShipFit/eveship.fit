import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DroneTooltip } from "./DroneTooltip";

const types = {
  Tristan: 593,
  "Hornet EC-300": 23707,
  "Hobgoblin II": 2456,
  "Mining Drone II": 10250,
};

const inBay = (typeId: number, state: "active" | "offline", quantity = 1) => ({
  args: { itemRef: 0, typeId },
  parameters: {
    fit: {
      ship: { type_id: types.Tristan },
      items: [{ type_id: typeId, slot: { type: "drone_bay" }, quantity, state }],
    },
  },
});

const meta = {
  component: DroneTooltip,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DroneTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ElectronicWarfare: Story = {
  ...inBay(types["Hornet EC-300"], "offline"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Hornet EC-300")).toBeVisible();
    await expect(canvas.getByText("Range within 7,500 m")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 0")).toBeVisible();
    await expect(canvas.getByText("Bandwidth Needed 5 Mbit/sec")).toBeVisible();
  },
};

/** The damage of one drone, however many are launched. */
export const Combat: Story = {
  ...inBay(types["Hobgoblin II"], "active", 3),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 4,625 m")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 2,625 m")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 19.8")).toBeVisible();
    await expect(canvas.getByText("20 HP Thermal damage")).toBeVisible();
    await expect(canvas.getByText(/^Turret Tracking: \d+\.\d\d$/)).toBeVisible();
  },
};

export const NotLaunched: Story = {
  ...inBay(types["Hobgoblin II"], "offline"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 0")).toBeVisible();
  },
};

export const Mining: Story = {
  ...inBay(types["Mining Drone II"], "active"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/^\d+ m³ per 60s \(\d+\.\d m³\/s\)$/)).toBeVisible();
    await expect(canvas.queryByText(/Turret Tracking/)).toBeNull();
    await expect(canvas.queryByText(/HP/)).toBeNull();
  },
};
