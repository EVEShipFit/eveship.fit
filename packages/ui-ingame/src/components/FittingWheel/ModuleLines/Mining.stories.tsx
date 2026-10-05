import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Mining } from "./Mining";

const types = {
  Venture: 32880,
  "Miner II": 482,
  "Gas Cloud Scoop I": 25266,
};

const fitted = (
  typeId: number,
  slot: "high" | "medium" | "low",
  chargeTypeId?: number,
  shipTypeId = types.Venture,
) => ({
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
  component: Mining,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Mining>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Miner: Story = {
  ...fitted(types["Miner II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Optimal range within 12 km")).toBeVisible();
    await expect(canvas.getByText("59 m³ per 15s (3.9 m³/s)")).toBeVisible();
  },
};

export const GasCloudScoop: Story = {
  ...fitted(types["Gas Cloud Scoop I"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Optimal range within 1,500 m")).toBeVisible();
    await expect(canvas.getByText("20 m³ per 22.5s (0.9 m³/s)")).toBeVisible();
  },
};
