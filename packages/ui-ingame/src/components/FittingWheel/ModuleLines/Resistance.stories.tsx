import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Resistance } from "./Resistance";

const types = {
  Rifter: 587,
  "Damage Control II": 2048,
  "Reactive Armor Hardener": 4403,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low") => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [{ type_id: typeId, slot: { type: slot, index: 0 }, state: "active" }],
    },
  },
});

const meta = {
  component: Resistance,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Resistance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DamageControl: Story = {
  ...fitted(types["Damage Control II"], "low"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Shield damage resistance")).toBeVisible();
    await expect(canvas.getByText("Armor damage resistance")).toBeVisible();
    await expect(canvas.getByText("Hull damage resistance")).toBeVisible();
    await expect(canvas.getAllByText("12.5%")).toHaveLength(4);
    await expect(canvas.getAllByText("15.0%")).toHaveLength(4);
    await expect(canvas.getAllByText("40.0%")).toHaveLength(4);
  },
};

export const ReactiveArmorHardener: Story = {
  ...fitted(types["Reactive Armor Hardener"], "low"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Armor damage resistance")).toBeVisible();
    await expect(canvas.queryByText("Shield damage resistance")).toBeNull();
    await expect(canvas.getAllByText("15.0%")).toHaveLength(4);
  },
};
