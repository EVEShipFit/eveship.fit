import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ActivationRange } from "./ActivationRange";
import { WarpScrambler } from "./WarpScrambler";

const types = {
  Rifter: 587,
  Broadsword: 12013,
  "Warp Scrambler II": 448,
  "Warp Disruptor II": 3244,
  "Warp Disruption Field Generator II": 4248,
  "Focused Warp Disruption Script": 29003,
  Keepstar: 35834,
  "Standup Focused Warp Disruptor I": 35949,
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
  component: WarpScrambler,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WarpScrambler>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scrambler: Story = {
  ...fitted(types["Warp Scrambler II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 9,000 m")).toBeVisible();
    await expect(canvas.getByText("Warp Scramble Strength: 2")).toBeVisible();
  },
};

export const Disruptor: Story = {
  ...fitted(types["Warp Disruptor II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 24 km")).toBeVisible();
    await expect(canvas.getByText("Warp Scramble Strength: 1")).toBeVisible();
  },
};

export const FieldGenerator: Story = {
  ...fitted(types["Warp Disruption Field Generator II"], "high", undefined, types.Broadsword),
  render: (args) => <ActivationRange {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 25 km")).toBeVisible();
    await expect(canvas.queryByText(/Strength/)).toBeNull();
  },
};

export const FocusedFieldGenerator: Story = {
  ...fitted(
    types["Warp Disruption Field Generator II"],
    "high",
    types["Focused Warp Disruption Script"],
    types.Broadsword,
  ),
  render: (args) => <ActivationRange {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 38 km")).toBeVisible();
  },
};

export const Structure: Story = {
  ...fitted(types["Standup Focused Warp Disruptor I"], "medium", undefined, types.Keepstar),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 210 km")).toBeVisible();
    await expect(canvas.getByText("Warp Scramble Strength: 100")).toBeVisible();
  },
};
