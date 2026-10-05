import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RemoteSensorBooster } from "./SensorBooster";

const types = {
  Rifter: 587,
  "Remote Sensor Booster II": 1964,
  "ECCM Script": 41155,
};

const fitted = (chargeTypeId?: number) => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [
        {
          type_id: types["Remote Sensor Booster II"],
          slot: { type: "medium", index: 0 },
          state: "active",
          ...(chargeTypeId === undefined ? {} : { charge: { type_id: chargeTypeId } }),
        },
      ],
    },
  },
});

const meta = {
  component: RemoteSensorBooster,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RemoteSensorBooster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Remote: Story = {
  ...fitted(),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 135 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 45 km")).toBeVisible();
    await expect(canvas.getByText("33% Scan Resolution Bonus")).toBeVisible();
    await expect(canvas.getByText("40% Maximum Targeting Range Bonus")).toBeVisible();
    await expect(canvas.getByText("60% Radar Strength")).toBeVisible();
  },
};

export const RemoteWithScript: Story = {
  ...fitted(types["ECCM Script"]),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Scan Resolution Bonus/)).toBeNull();
    await expect(canvas.queryByText(/Maximum Targeting Range Bonus/)).toBeNull();
    await expect(canvas.getByText("120% Radar Strength")).toBeVisible();
  },
};
