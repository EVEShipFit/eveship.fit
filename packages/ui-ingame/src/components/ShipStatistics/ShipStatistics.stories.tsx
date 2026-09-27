import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { ShipStatistics } from "./ShipStatistics";

const types = {
  Rifter: 587,
  Merlin: 603,
  "200mm AutoCannon II": 2889,
  "EMP S": 185,
  "1MN Afterburner II": 438,
  "Small Armor Repairer II": 1183,
};

/** Guns that reload, and an afterburner and armor repairer that drain the capacitor. */
const rifter = {
  name: "Storybook Rifter",
  ship: { type_id: types.Rifter },
  items: [
    {
      type_id: types["200mm AutoCannon II"],
      slot: { type: "high", index: 0 },
      state: "active",
      charge: { type_id: types["EMP S"] },
    },
    {
      type_id: types["200mm AutoCannon II"],
      slot: { type: "high", index: 1 },
      state: "active",
      charge: { type_id: types["EMP S"] },
    },
    { type_id: types["1MN Afterburner II"], slot: { type: "medium", index: 0 }, state: "active" },
    { type_id: types["Small Armor Repairer II"], slot: { type: "low", index: 0 }, state: "active" },
  ],
};

const meta = {
  component: ShipStatistics,
} satisfies Meta<typeof ShipStatistics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Statistics" }).getBoundingClientRect().width).toBe(280);
    await expect(canvas.getByRole("button", { name: /^Capacitor/ })).toHaveTextContent("Stable");
    await expect(canvas.getByRole("button", { name: /^Offense/ })).toHaveTextContent("0.0 dps");
    await expect(canvas.getByRole("group", { name: "Damage per Second" })).toHaveTextContent(/^0\.0 dps$/);
    await expect(canvas.getByRole("group", { name: "Alpha Strike" })).toHaveTextContent("0 HP");
    await expect(canvas.getByRole("group", { name: "Sensor Strength" }).querySelector("img")).toHaveAttribute(
      "data-icon",
      "stat-sensor-minmatar",
    );
    await expect(canvas.getByRole("group", { name: "Active Drones" })).toHaveTextContent("0 Active");
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toHaveTextContent("0.0M ISK");
  },
};

export const FittedRifter: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Capacitor/ })).toHaveTextContent(/Depletes in \d\d:\d\d:\d\d$/);
    await expect(canvas.getByRole("group", { name: "Damage per Second" })).toHaveTextContent(
      /^[\d.]+ dps \([\d.]+ dps\)$/,
    );
  },
};

export const CaldariSensors: Story = {
  parameters: { fit: { ship: types.Merlin } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Sensor Strength" }).querySelector("img")).toHaveAttribute(
      "data-icon",
      "stat-sensor-caldari",
    );
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Statistics" }).getBoundingClientRect().width).toBe(420);
  },
};
