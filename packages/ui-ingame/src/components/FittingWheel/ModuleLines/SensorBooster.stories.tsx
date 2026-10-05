import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RemoteSensorBooster, SensorBooster } from "./SensorBooster";

const types = {
  Rifter: 587,
  "Remote Sensor Booster II": 1964,
  "Sensor Booster II": 1952,
  "Remote Sensor Dampener II": 1969,
  "Scan Resolution Dampening Script": 29013,
  "ECCM Script": 41155,
};

const fitted = (chargeTypeId?: number, typeId = types["Remote Sensor Booster II"]) => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [
        {
          type_id: typeId,
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

export const Local: Story = {
  ...fitted(undefined, types["Sensor Booster II"]),
  render: (args) => <SensorBooster {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Range within/)).toBeNull();
    await expect(canvas.getByText("30% Scan Resolution Bonus")).toBeVisible();
    await expect(canvas.getByText("30% Maximum Targeting Range Bonus")).toBeVisible();
  },
};

export const LocalWithScript: Story = {
  ...fitted(types["ECCM Script"], types["Sensor Booster II"]),
  render: (args) => <SensorBooster {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Scan Resolution Bonus/)).toBeNull();
    await expect(canvas.getByText("96% Gravimetric Strength")).toBeVisible();
    await expect(canvas.getByText("96% Radar Strength")).toBeVisible();
  },
};

export const Dampener: Story = {
  ...fitted(undefined, types["Remote Sensor Dampener II"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 135 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 45 km")).toBeVisible();
    await expect(canvas.getByText("-19% Scan Resolution Bonus")).toBeVisible();
    await expect(canvas.getByText("-19% Maximum Targeting Range Bonus")).toBeVisible();
    await expect(canvas.queryByText(/Strength/)).toBeNull();
  },
};

export const DampenerWithScript: Story = {
  ...fitted(types["Scan Resolution Dampening Script"], types["Remote Sensor Dampener II"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-38% Scan Resolution Bonus")).toBeVisible();
    await expect(canvas.queryByText(/Maximum Targeting Range Bonus/)).toBeNull();
  },
};
