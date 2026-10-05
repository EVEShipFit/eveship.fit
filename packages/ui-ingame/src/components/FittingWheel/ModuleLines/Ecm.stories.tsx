import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { BurstJammer, Ecm } from "./Ecm";

const types = {
  Rifter: 587,
  "Multispectral ECM II": 2567,
  "Burst Jammer II": 2117,
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
  component: Ecm,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Ecm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multispectral: Story = {
  ...fitted(types["Multispectral ECM II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 67 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 35 km")).toBeVisible();
    await expect(canvas.getByText("3.2 Gravimetric ECM Jammer Strength")).toBeVisible();
    await expect(canvas.getByText("3.2 RADAR ECM Jammer Strength")).toBeVisible();
  },
};

export const Burst: Story = {
  ...fitted(types["Burst Jammer II"], "medium"),
  render: (args) => <BurstJammer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 18 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
    await expect(canvas.getByText("9.0 Ladar ECM Jammer Strength")).toBeVisible();
  },
};
