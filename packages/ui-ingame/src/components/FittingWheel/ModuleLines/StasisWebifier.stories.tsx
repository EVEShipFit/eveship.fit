import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { StasisWebifier } from "./StasisWebifier";

const types = {
  Rifter: 587,
  "Stasis Webifier II": 527,
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
