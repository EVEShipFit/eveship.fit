import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CapacitorBooster } from "./CapacitorBooster";

const types = {
  Rifter: 587,
  "Medium Capacitor Booster II": 2024,
  "Navy Cap Booster 400": 32006,
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
  component: CapacitorBooster,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CapacitorBooster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capacitor: Story = {
  ...fitted(types["Medium Capacitor Booster II"], "medium", types["Navy Cap Booster 400"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("400 GJ per 12s")).toBeVisible();
  },
};

export const EmptyCapacitor: Story = {
  ...fitted(types["Medium Capacitor Booster II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/GJ per/)).toBeNull();
  },
};
