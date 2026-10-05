import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Missile } from "./Missile";

const types = {
  Drake: 24698,
  "Heavy Missile Launcher II": 2410,
  "Scourge Heavy Missile": 209,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Drake) => ({
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
  component: Missile,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Missile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  ...fitted(types["Heavy Missile Launcher II"], "high", types["Scourge Heavy Missile"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max flight range")).toBeVisible();
    await expect(canvas.getByText("79 km")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 37.2")).toBeVisible();
    await expect(canvas.getByText("307 HP Kinetic damage")).toBeVisible();
  },
};

export const Empty: Story = {
  ...fitted(types["Heavy Missile Launcher II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Max flight range")).toBeNull();
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
  },
};
