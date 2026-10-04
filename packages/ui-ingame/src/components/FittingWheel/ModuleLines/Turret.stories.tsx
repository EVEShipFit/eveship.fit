import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Turret } from "./Turret";

const types = {
  Rifter: 587,
  "200mm AutoCannon II": 2889,
  "Hail S": 12608,
  Kikimora: 49710,
  "Light Entropic Disintegrator II": 47914,
  "Baryon Exotic Plasma S": 47924,
};

const fitted = (chargeTypeId?: number, shipTypeId = types.Rifter, typeId = types["200mm AutoCannon II"]) => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: shipTypeId },
      items: [
        {
          type_id: typeId,
          slot: { type: "high", index: 0 },
          state: "active",
          ...(chargeTypeId === undefined ? {} : { charge: { type_id: chargeTypeId } }),
        },
      ],
    },
  },
});

const meta = {
  component: Turret,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Turret>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  ...fitted(types["Hail S"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Falloff range within 8,006 m")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 750 m")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 57.5")).toBeVisible();
    await expect(canvas.getByText("21 HP")).toBeVisible();
    await expect(canvas.getByText("76 HP")).toBeVisible();
    await expect(canvas.getByText("Turret Tracking: 295.31")).toBeVisible();
  },
};

export const Empty: Story = {
  ...fitted(),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Falloff range within 11,175 m")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
    await expect(canvas.queryByText("Damage caused")).toBeNull();
    await expect(canvas.getByText("Turret Tracking: 393.75")).toBeVisible();
  },
};

export const Disintegrator: Story = {
  ...fitted(types["Baryon Exotic Plasma S"], types.Kikimora, types["Light Entropic Disintegrator II"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 134.2-419.3")).toBeVisible();
  },
};
