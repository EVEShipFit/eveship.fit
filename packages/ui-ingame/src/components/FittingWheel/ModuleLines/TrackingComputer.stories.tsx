import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RemoteTrackingComputer, TrackingComputer } from "./TrackingComputer";

const types = {
  Rifter: 587,
  "Remote Tracking Computer II": 2104,
  "Tracking Computer II": 1978,
  "Optimal Range Script": 28999,
};

const fitted = (chargeTypeId?: number, typeId = types["Remote Tracking Computer II"]) => ({
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
  component: RemoteTrackingComputer,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RemoteTrackingComputer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Remote: Story = {
  ...fitted(),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 108 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 72 km")).toBeVisible();
    await expect(canvas.getByText("Falloff Bonus: 15%")).toBeVisible();
    await expect(canvas.getByText("Optimal Range Bonus: 8%")).toBeVisible();
    await expect(canvas.getByText("Tracking Speed Bonus: 15%")).toBeVisible();
  },
};

export const RemoteWithScript: Story = {
  ...fitted(types["Optimal Range Script"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Falloff Bonus: 30%")).toBeVisible();
    await expect(canvas.getByText("Optimal Range Bonus: 15%")).toBeVisible();
    await expect(canvas.getByText("Tracking Speed Bonus: 0%")).toBeVisible();
  },
};

export const Local: Story = {
  ...fitted(undefined, types["Tracking Computer II"]),
  render: (args) => <TrackingComputer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Range within/)).toBeNull();
    await expect(canvas.getByText("Falloff Bonus: 15%")).toBeVisible();
    await expect(canvas.getByText("Optimal Range Bonus: 8%")).toBeVisible();
    await expect(canvas.getByText("Tracking Speed Bonus: 15%")).toBeVisible();
  },
};

export const LocalWithScript: Story = {
  ...fitted(types["Optimal Range Script"], types["Tracking Computer II"]),
  render: (args) => <TrackingComputer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Falloff Bonus: 30%")).toBeVisible();
    await expect(canvas.getByText("Optimal Range Bonus: 15%")).toBeVisible();
    await expect(canvas.getByText("Tracking Speed Bonus: 0%")).toBeVisible();
  },
};
