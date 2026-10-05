import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import {
  AncillaryRemoteArmorRepairer,
  AncillaryRemoteShieldBooster,
  ArmorRepairer,
  HullRepairer,
  RemoteArmorRepairer,
  RemoteHullRepairer,
  RemoteShieldBooster,
  ShieldBooster,
} from "./Repairer";

const types = {
  Rifter: 587,
  "Medium Shield Booster II": 10850,
  "Medium Ancillary Shield Booster": 32772,
  "Medium Armor Repairer II": 3530,
  "Medium Ancillary Armor Repairer": 33101,
  "Nanite Repair Paste": 28668,
  "Medium Remote Armor Repairer II": 26913,
  "Medium Ancillary Remote Armor Repairer": 41477,
  "Medium Hull Repairer II": 3655,
  "Medium Remote Hull Repairer II": 4296,
  "Medium Remote Shield Booster II": 3598,
  "Medium Ancillary Remote Shield Booster": 41481,
  "Cap Booster 100": 3554,
  Rodiva: 49712,
  "Heavy Mutadaptive Remote Armor Repairer II": 49773,
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

export const RemoteArmor: Story = {
  ...fitted(types["Medium Remote Armor Repairer II"], "high"),
  render: (args) => <RemoteArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 14 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 11 km")).toBeVisible();
    await expect(canvas.getByText("256 HP repaired per 6s")).toBeVisible();
  },
};

export const AncillaryRemoteArmor: Story = {
  ...fitted(types["Medium Ancillary Remote Armor Repairer"], "high"),
  render: (args) => <AncillaryRemoteArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 8,750 m")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
    await expect(canvas.getByText("145 HP repaired per 6s")).toBeVisible();
  },
};

export const PastedAncillaryRemoteArmor: Story = {
  ...fitted(types["Medium Ancillary Remote Armor Repairer"], "high", types["Nanite Repair Paste"]),
  render: (args) => <AncillaryRemoteArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("435 HP repaired per 6s")).toBeVisible();
  },
};

export const Hull: Story = {
  ...fitted(types["Medium Hull Repairer II"], "low"),
  render: (args) => <HullRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("60 HP per 18s")).toBeVisible();
  },
};

export const RemoteHull: Story = {
  ...fitted(types["Medium Remote Hull Repairer II"], "high"),
  render: (args) => <RemoteHullRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 17 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 11 km")).toBeVisible();
    await expect(canvas.getByText("115 HP per 6s")).toBeVisible();
  },
};

export const RemoteShield: Story = {
  ...fitted(types["Medium Remote Shield Booster II"], "high"),
  render: (args) => <RemoteShieldBooster {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 15 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 6,000 m")).toBeVisible();
    await expect(canvas.getByText("340 HP transported per 8s")).toBeVisible();
  },
};

export const AncillaryRemoteShield: Story = {
  ...fitted(types["Medium Ancillary Remote Shield Booster"], "high", types["Cap Booster 100"]),
  render: (args) => <AncillaryRemoteShieldBooster {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 13 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 5,000 m")).toBeVisible();
    await expect(canvas.queryByText(/HP/)).toBeNull();
  },
};

export const MutadaptiveRemoteArmor: Story = {
  ...fitted(types["Heavy Mutadaptive Remote Armor Repairer II"], "high", undefined, types.Rodiva),
  render: (args) => <RemoteArmorRepairer {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 75 km")).toBeVisible();
    await expect(canvas.queryByText(/Optimal range/)).toBeNull();
    await expect(canvas.getByText("832 HP repaired per 6s")).toBeVisible();
  },
};
