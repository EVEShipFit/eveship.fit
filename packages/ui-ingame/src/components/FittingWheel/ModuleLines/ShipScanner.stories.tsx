import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CargoScanner as CargoScannerLine, ShipScanner } from "./ShipScanner";

const types = {
  Rifter: 587,
  "Ship Scanner II": 1855,
  "Cargo Scanner II": 2038,
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
  component: ShipScanner,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShipScanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  ...fitted(types["Ship Scanner II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 60 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
  },
};

export const CargoScanner: Story = {
  ...fitted(types["Cargo Scanner II"], "medium"),
  render: (args) => <CargoScannerLine {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 70 km")).toBeVisible();
  },
};
