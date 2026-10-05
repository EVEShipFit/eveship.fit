import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Compressor } from "./Compressor";

const types = {
  Porpoise: 42244,
  "Medium Asteroid Ore Compressor I": 62622,
};

const fitted = (
  typeId: number,
  slot: "high" | "medium" | "low",
  chargeTypeId?: number,
  shipTypeId = types.Porpoise,
) => ({
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
  component: Compressor,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Compressor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  ...fitted(types["Medium Asteroid Ore Compressor I"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Ships in your fleet have to be within 66 km to use compression.")).toBeVisible();
  },
};
