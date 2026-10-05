import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ModuleTooltip } from "./ModuleTooltip";

const meta = {
  component: ModuleTooltip,
  args: { rack: "high", itemRef: 0, typeId: 2889, state: "active", maxState: "overload" },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", border: "1px solid var(--esf-border)", padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModuleTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("200mm AutoCannon II")).toBeVisible();
    await expect(canvas.getByText("Active Module")).toHaveStyle({ color: "rgb(138, 224, 74)" });
  },
};

export const WithCharge: Story = {
  args: { chargeTypeId: 185 },
  parameters: {
    fit: {
      ship: { type_id: 587 },
      items: [{ type_id: 2889, slot: { type: "high", index: 0 }, state: "active", charge: { type_id: 185 } }],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("120 EMP S")).toBeVisible();
  },
};

export const Overheated: Story = {
  args: { state: "overload" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Overheated Module")).toHaveStyle({ color: "rgb(253, 45, 45)" });
  },
};

export const Online: Story = {
  args: { state: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Online Module")).toBeVisible();
  },
};

export const Offline: Story = {
  args: { state: "offline" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Offline Module")).toHaveStyle({ color: "rgb(138, 144, 150)" });
  },
};

export const Passive: Story = {
  args: { rack: "medium", typeId: 380, state: "online", maxState: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Online Passive Module")).toBeVisible();
  },
};

export const OfflinePassive: Story = {
  args: { rack: "medium", typeId: 380, state: "offline", maxState: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Offline Passive Module")).toBeVisible();
  },
};

export const Rig: Story = {
  args: { rack: "rig", typeId: 31668, state: "online", maxState: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Active Rig")).toBeVisible();
  },
};

export const InactiveRig: Story = {
  args: { rack: "rig", typeId: 31668, state: "offline", maxState: "online" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Inactive Rig")).toHaveStyle({ color: "rgb(138, 144, 150)" });
  },
};

export const WithLines: Story = {
  args: { rack: "medium", typeId: 5973, state: "active", maxState: "overload" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/^Max Velocity with: /)).toBeVisible();
  },
};

export const WithResistanceBonus: Story = {
  args: { rack: "medium", typeId: 2281, state: "active", maxState: "overload" },
  parameters: {
    fit: { ship: { type_id: 587 }, items: [{ type_id: 2281, slot: { type: "medium", index: 0 }, state: "active" }] },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Resistance Bonus:")).toBeVisible();
  },
};

export const WithResistance: Story = {
  args: { rack: "low", typeId: 2048, state: "online", maxState: "online" },
  parameters: {
    fit: { ship: { type_id: 587 }, items: [{ type_id: 2048, slot: { type: "low", index: 0 }, state: "online" }] },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Hull damage resistance")).toBeVisible();
  },
};
