import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { SignatureSuppressor, TargetPainter } from "./SignatureRadius";

const types = {
  Rifter: 587,
  "Target Painter II": 19806,
  "Signature Radius Suppressor I": 4409,
  Keepstar: 35834,
  "Standup Target Painter I": 35947,
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
  component: TargetPainter,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TargetPainter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Painter: Story = {
  ...fitted(types["Target Painter II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 189 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 54 km")).toBeVisible();
    await expect(canvas.getByText("38% Signature Radius Modifier")).toBeVisible();
  },
};

export const Suppressor: Story = {
  ...fitted(types["Signature Radius Suppressor I"], "medium"),
  render: (args) => <SignatureSuppressor {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("10% Signature Radius Bonus")).toBeVisible();
  },
};

export const StructurePainter: Story = {
  ...fitted(types["Standup Target Painter I"], "medium", undefined, types.Keepstar),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 75 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range within/)).toBeNull();
    await expect(canvas.getByText("65% Signature Radius Modifier")).toBeVisible();
  },
};
