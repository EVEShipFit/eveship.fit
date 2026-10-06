import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { StasisGrappler, StasisWebifier } from "./StasisWebifier";

const types = {
  Rifter: 587,
  "Stasis Webifier II": 527,
  Keepstar: 35834,
  "Standup Stasis Webifier I": 35943,
  "Heavy Stasis Grappler II": 41057,
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
  component: StasisWebifier,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StasisWebifier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  ...fitted(types["Stasis Webifier II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 10 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
    await expect(canvas.getByText("Reduces target ship's velocity by 60%")).toBeVisible();
  },
};

export const Structure: Story = {
  ...fitted(types["Standup Stasis Webifier I"], "medium", undefined, types.Keepstar),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 200 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range within/)).toBeNull();
    await expect(canvas.getByText("Reduces target ship's velocity by 70%")).toBeVisible();
  },
};

export const Grappler: Story = {
  ...fitted(types["Heavy Stasis Grappler II"], "medium"),
  render: (args) => <StasisGrappler {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 11 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 1,000 m")).toBeVisible();
    await expect(canvas.queryByText(/Reduces target ship's velocity/)).toBeNull();
  },
};
