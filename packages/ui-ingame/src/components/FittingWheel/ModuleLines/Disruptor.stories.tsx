import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { WeaponDisruptor } from "./Disruptor";

const types = {
  Rifter: 587,
  Keepstar: 35834,
  "Tracking Disruptor II": 2109,
  "Guidance Disruptor II": 37546,
  "Optimal Range Disruption Script": 29005,
  "Missile Precision Disruption Script": 40335,
  "Standup Weapon Disruptor I": 35945,
};

const fitted = (typeId: number, slot: "high" | "medium", chargeTypeId?: number, shipTypeId = types.Rifter) => ({
  args: { itemRef: 0, typeId, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: shipTypeId },
      items: [
        {
          type_id: typeId,
          slot: { type: slot, index: 0 },
          state: "active",
          ...(chargeTypeId === undefined ? {} : { charge: { type_id: chargeTypeId } }),
        },
      ],
    },
  },
});

const meta = {
  component: WeaponDisruptor,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WeaponDisruptor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tracking: Story = {
  ...fitted(types["Tracking Disruptor II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 108 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 72 km")).toBeVisible();
    await expect(canvas.getByText("-21% Falloff Bonus")).toBeVisible();
    await expect(canvas.getByText("-21% Optimal Range Bonus")).toBeVisible();
    await expect(canvas.getByText("-21% Tracking Speed Bonus")).toBeVisible();
  },
};

export const TrackingWithScript: Story = {
  ...fitted(types["Tracking Disruptor II"], "medium", types["Optimal Range Disruption Script"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-43% Falloff Bonus")).toBeVisible();
    await expect(canvas.getByText("-43% Optimal Range Bonus")).toBeVisible();
    await expect(canvas.queryByText(/Tracking Speed/)).toBeNull();
  },
};

export const Guidance: Story = {
  ...fitted(types["Guidance Disruptor II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 108 km")).toBeVisible();
    await expect(canvas.getByText("-11% Missile Velocity Bonus")).toBeVisible();
    await expect(canvas.getByText("-11% Missile Velocity Bonus").querySelector("img")).toBeNull();
    await expect(canvas.getByText("-11% Flight Time Bonus")).toBeVisible();
    await expect(canvas.getByText("-15% Explosion Velocity Bonus")).toBeVisible();
    await expect(canvas.getByText("15% Explosion Radius Bonus")).toBeVisible();
  },
};

export const GuidanceWithScript: Story = {
  ...fitted(types["Guidance Disruptor II"], "medium", types["Missile Precision Disruption Script"]),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Missile Velocity/)).toBeNull();
    await expect(canvas.queryByText(/Flight Time/)).toBeNull();
    await expect(canvas.getByText("-30% Explosion Velocity Bonus")).toBeVisible();
    await expect(canvas.getByText("30% Explosion Radius Bonus")).toBeVisible();
  },
};

export const StructureWeaponDisruptor: Story = {
  ...fitted(types["Standup Weapon Disruptor I"], "medium", undefined, types.Keepstar),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 150 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range within/)).toBeNull();
    await expect(canvas.getByText("-60% Falloff Bonus")).toBeVisible();
    await expect(canvas.getByText("-60% Optimal Range Bonus")).toBeVisible();
    await expect(canvas.getByText("-60% Tracking Speed Bonus")).toBeVisible();
    await expect(canvas.getByText("-37% Missile Velocity Bonus")).toBeVisible();
    await expect(canvas.getByText("-30% Flight Time Bonus")).toBeVisible();
    await expect(canvas.getByText("-50% Explosion Velocity Bonus")).toBeVisible();
    await expect(canvas.getByText("50% Explosion Radius Bonus")).toBeVisible();
  },
};
