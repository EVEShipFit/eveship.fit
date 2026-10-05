import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Cloak } from "./Cloak";

const types = {
  Helios: 11172,
  Rifter: 587,
  "Covert Ops Cloaking Device II": 11578,
  "Improved Cloaking Device II": 11577,
  "Prototype Cloaking Device I": 11370,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Helios) => ({
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
  component: Cloak,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Cloak>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CovertOps: Story = {
  ...fitted(types["Covert Ops Cloaking Device II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("25% Maximum Velocity Modifier")).toBeVisible();
  },
};

export const Improved: Story = {
  ...fitted(types["Improved Cloaking Device II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-69% Maximum Velocity Modifier")).toBeVisible();
  },
};

export const Prototype: Story = {
  ...fitted(types["Prototype Cloaking Device I"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-87% Maximum Velocity Modifier")).toBeVisible();
  },
};

export const Unbonused: Story = {
  ...fitted(types["Covert Ops Cloaking Device II"], "high", undefined, types.Rifter),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0% Maximum Velocity Modifier")).toBeVisible();
  },
};
