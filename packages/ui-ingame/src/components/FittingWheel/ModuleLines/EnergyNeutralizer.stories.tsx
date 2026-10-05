import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { EnergyNeutralizer, EnergyNosferatu } from "./EnergyNeutralizer";

const types = {
  Rifter: 587,
  "Medium Energy Neutralizer II": 12267,
  "Medium Energy Nosferatu II": 12259,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Rifter) => ({
  args: { itemRef: 0, state: "active" as const },
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
  component: EnergyNeutralizer,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EnergyNeutralizer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutralizer: Story = {
  ...fitted(types["Medium Energy Neutralizer II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 15 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 10 km")).toBeVisible();
    await expect(canvas.getByText("180 GJ neutralized per 12s")).toBeVisible();
  },
};

export const Nosferatu: Story = {
  ...fitted(types["Medium Energy Nosferatu II"], "high"),
  render: (args) => <EnergyNosferatu {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 15 km")).toBeVisible();
    await expect(canvas.getByText("36 Points leeched per 5s")).toBeVisible();
  },
};
