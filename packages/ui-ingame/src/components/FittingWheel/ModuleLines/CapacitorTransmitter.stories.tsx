import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RemoteCapacitorTransmitter } from "./CapacitorTransmitter";

const types = {
  Rifter: 587,
  "Medium Remote Capacitor Transmitter II": 12221,
};

const meta = {
  component: RemoteCapacitorTransmitter,
  args: { itemRef: 0, typeId: types["Medium Remote Capacitor Transmitter II"], state: "active" },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [
        { type_id: types["Medium Remote Capacitor Transmitter II"], slot: { type: "high", index: 0 }, state: "active" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RemoteCapacitorTransmitter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Remote: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 6,500 m")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
    await expect(canvas.getByText("117.00 Points per 5s")).toBeVisible();
  },
};
