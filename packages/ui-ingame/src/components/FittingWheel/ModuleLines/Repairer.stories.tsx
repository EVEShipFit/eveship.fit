import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ArmorRepairer, ShieldBooster } from "./Repairer";

const types = {
  Rifter: 587,
  "Medium Shield Booster II": 10850,
  "Medium Ancillary Shield Booster": 32772,
  "Medium Armor Repairer II": 3530,
  "Medium Ancillary Armor Repairer": 33101,
  "Nanite Repair Paste": 28668,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Rifter) => ({
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
  component: ShieldBooster,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShieldBooster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shield: Story = {
  ...fitted(types["Medium Shield Booster II"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("104 HP bonus per 3s")).toBeVisible();
  },
};

export const AncillaryShield: Story = {
  ...fitted(types["Medium Ancillary Shield Booster"], "medium"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("146 HP bonus per 3s")).toBeVisible();
  },
};

export const Armor: Story = {
  ...fitted(types["Medium Armor Repairer II"], "low"),
  render: (args) => <ArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("368 HP repaired per 9s")).toBeVisible();
  },
};

export const AncillaryArmor: Story = {
  ...fitted(types["Medium Ancillary Armor Repairer"], "low"),
  render: (args) => <ArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("207 HP repaired per 9s")).toBeVisible();
  },
};

export const PastedAncillaryArmor: Story = {
  ...fitted(types["Medium Ancillary Armor Repairer"], "low", types["Nanite Repair Paste"]),
  render: (args) => <ArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("621 HP repaired per 9s")).toBeVisible();
  },
};
