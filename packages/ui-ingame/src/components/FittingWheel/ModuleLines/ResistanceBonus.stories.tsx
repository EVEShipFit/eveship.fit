import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ResistanceBonus } from "./ResistanceBonus";

const types = {
  Rifter: 587,
  "Multispectrum Shield Hardener II": 2281,
  "Thermal Armor Hardener II": 11648,
  "Multispectrum Coating II": 1306,
  "Small EM Shield Reinforcer I": 31716,
};

const fitted = (typeId: number, slot: "medium" | "low" | "rig") => ({
  args: { itemRef: 0, state: "online" as const },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [{ type_id: typeId, slot: { type: slot, index: 0 }, state: "online" }],
    },
  },
});

const meta = {
  component: ResistanceBonus,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResistanceBonus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShieldHardener: Story = {
  ...fitted(types["Multispectrum Shield Hardener II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Resistance Bonus:")).toBeVisible();
    await expect(canvas.getAllByText("-32.5%")).toHaveLength(4);
  },
};

export const ArmorHardener: Story = {
  ...fitted(types["Thermal Armor Hardener II"], "low"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-55% Thermal Damage Resistance Bonus")).toBeVisible();
    await expect(canvas.queryByText("Resistance Bonus:")).toBeNull();
  },
};

export const Coating: Story = {
  ...fitted(types["Multispectrum Coating II"], "low"),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("-19.2%")).toHaveLength(4);
  },
};

export const Rig: Story = {
  ...fitted(types["Small EM Shield Reinforcer I"], "rig"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("-30% EM Damage Resistance Bonus")).toBeVisible();
  },
};
