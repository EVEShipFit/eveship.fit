import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ModuleTooltip } from "./ModuleTooltip";

const meta = {
  component: ModuleTooltip,
  args: { rack: "high", typeId: 2889, state: "active", maxState: "overload" },
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
  play: async ({ canvas }) => {
    await expect(canvas.getByText("EMP S")).toBeVisible();
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

const types = {
  Rifter: 587,
  "5MN Y-T8 Compact Microwarpdrive": 5973,
  "1MN Afterburner II": 438,
};

const propulsion = (typeId: number, state: "offline" | "active" | "overload") =>
  ({
    args: { rack: "medium", typeId, state, maxState: "overload" },
    parameters: {
      fit: { ship: { type_id: types.Rifter }, items: [{ type_id: typeId, slot: { type: "medium", index: 0 }, state }] },
    },
  }) as const;

export const Microwarpdrive: Story = {
  ...propulsion(types["5MN Y-T8 Compact Microwarpdrive"], "active"),
  play: async ({ canvas }) => {
    const line = canvas.getByText("Max Velocity with: 3213.19 m/s");
    await expect(line).toBeVisible();
    await expect(line.querySelector("img")).toHaveAttribute("src", expect.stringMatching(/\.webp$/));
  },
};

export const OverheatedMicrowarpdrive: Story = {
  ...propulsion(types["5MN Y-T8 Compact Microwarpdrive"], "overload"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity with: 4591.65 m/s")).toBeVisible();
  },
};

export const OfflineMicrowarpdrive: Story = {
  ...propulsion(types["5MN Y-T8 Compact Microwarpdrive"], "offline"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity without: 456.25 m/s")).toBeVisible();
  },
};

export const Afterburner: Story = {
  ...propulsion(types["1MN Afterburner II"], "active"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity with: 1193.25 m/s")).toBeVisible();
  },
};
