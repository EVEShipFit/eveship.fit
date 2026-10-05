import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DroneTooltip } from "./DroneTooltip";

const types = {
  Tristan: 593,
  "Hornet EC-300": 23707,
  "Hobgoblin II": 2456,
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
    await expect(canvas.getByText("Falloff range within 4,625 m")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 2,625 m")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 19.8")).toBeVisible();
  },
};

export const NotLaunched: Story = {
  ...inBay(types["Hobgoblin II"], "offline"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 0")).toBeVisible();
  },
};
