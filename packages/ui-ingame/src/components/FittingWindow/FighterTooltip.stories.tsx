import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FighterTooltip } from "./FighterTooltip";

const types = {
  Thanatos: 23911,
  "Einherji I": 23061,
  "Scarab I": 40345,
};

const squadron = (typeId: number, quantity: number, slot: "fighter_tube" | "fighter_bay" = "fighter_tube") => ({
  args: { itemRef: 0, typeId, quantity },
  parameters: {
    fit: {
      ship: { type_id: types.Thanatos },
      items: [
        {
          type_id: typeId,
          slot: slot === "fighter_tube" ? { type: slot, index: 0 } : { type: slot },
          quantity,
          state: slot === "fighter_tube" ? "active" : "offline",
        },
      ],
    },
  },
});

const meta = {
  component: FighterTooltip,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FighterTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heavy: Story = {
  ...squadron(types["Einherji I"], 6),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("6x Einherji I")).toBeVisible();
    await expect(canvas.getByText("Autocannon - Damage Per Second 261.6")).toBeVisible();
    await expect(canvas.getByText("Falloff range within 15 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 5,000 m")).toBeVisible();
    await expect(canvas.getByText("Heavy Rocket Salvo - Damage Per Second 170.3")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 13 km")).toBeVisible();
    await expect(canvas.getByText("Maximum Targeting Range: 60 km")).toBeVisible();
    await expect(canvas.getByText("Scan Resolution: 700.0 mm")).toBeVisible();
    await expect(canvas.getByText("Signature Radius: 110.0 m")).toBeVisible();
  },
};

export const PartialSquadron: Story = {
  ...squadron(types["Einherji I"], 3),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3x Einherji I")).toBeVisible();
    await expect(canvas.getByText("Autocannon - Damage Per Second 130.8")).toBeVisible();
  },
};

export const Support: Story = {
  ...squadron(types["Scarab I"], 3),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3x Scarab I")).toBeVisible();
    await expect(canvas.getByText("Falloff range within 11 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 5,000 m")).toBeVisible();
    await expect(canvas.queryByText(/Damage Per Second/)).toBeNull();
  },
};

export const InTheBay: Story = {
  ...squadron(types["Einherji I"], 6, "fighter_bay"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Autocannon - Damage Per Second 0")).toBeVisible();
    await expect(canvas.getByText("Heavy Rocket Salvo - Damage Per Second 0")).toBeVisible();
  },
};
