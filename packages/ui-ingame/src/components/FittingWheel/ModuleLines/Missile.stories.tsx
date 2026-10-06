import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Missile } from "./Missile";

const types = {
  Drake: 24698,
  "Heavy Missile Launcher II": 2410,
  "Scourge Heavy Missile": 209,
  Raven: 638,
  "Cruise Missile Launcher II": 19739,
  "Inferno Auto-Targeting Cruise Missile I": 1832,
  Purifier: 12038,
  "Bomb Launcher I": 27914,
  "Scorch Bomb": 27916,
  "Defender Launcher I": 44102,
  "Defender Missile I": 32782,
  Sabre: 22456,
  "Interdiction Sphere Launcher I": 22782,
  "Warp Disrupt Probe": 22778,
  "Festival Launcher": 19660,
  "Barium Firework": 33572,
  "Civilian Light Missile Launcher": 32461,
  "Scourge Light Missile": 210,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Drake) => ({
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

export const AutoTargeting: Story = {
  ...fitted(types["Cruise Missile Launcher II"], "high", types["Inferno Auto-Targeting Cruise Missile I"], types.Raven),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("200 km")).toBeVisible();
  },
};

export const Bomb: Story = {
  ...fitted(types["Bomb Launcher I"], "high", types["Scorch Bomb"], types.Purifier),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 30 km")).toBeVisible();
    await expect(canvas.queryByText("Max flight range")).toBeNull();
    await expect(canvas.getByText("5,800 HP Thermal damage")).toBeVisible();
  },
};

export const Defender: Story = {
  ...fitted(types["Defender Launcher I"], "high", types["Defender Missile I"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/^Range within \d+ km$/)).toBeVisible();
    await expect(canvas.getByText("Damage caused")).toBeVisible();
  },
};

export const InterdictionSphere: Story = {
  ...fitted(types["Interdiction Sphere Launcher I"], "high", types["Warp Disrupt Probe"], types.Sabre),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Range within/)).toBeNull();
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
  },
};

export const Festival: Story = {
  ...fitted(types["Festival Launcher"], "high", types["Barium Firework"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 100 km")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
  },
};

export const Civilian: Story = {
  ...fitted(types["Civilian Light Missile Launcher"], "high", types["Scourge Light Missile"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/^Range within \d+ km$/)).toBeVisible();
    await expect(canvas.queryByText("Max flight range")).toBeNull();
  },
};
