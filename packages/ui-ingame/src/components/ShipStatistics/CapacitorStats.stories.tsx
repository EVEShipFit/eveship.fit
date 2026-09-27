import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CapacitorStats } from "./CapacitorStats";

const types = {
  Rifter: 587,
  "1MN Afterburner II": 438,
  "Small Armor Repairer II": 1183,
};

const meta = {
  component: CapacitorStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof CapacitorStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stable: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Capacitor/ })).toHaveTextContent("Stable");
    await expect(canvas.getByRole("group", { name: "Capacity / Recharge Time" })).toHaveTextContent(
      "312.5 GJ / 1m 34s",
    );
    await expect(canvas.getByRole("group", { name: "Peak Recharge Minus Usage" })).toHaveTextContent(
      "Δ 8.3 GJ/s (100.0%)",
    );
  },
};

export const Depletes: Story = {
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [
        { type_id: types["1MN Afterburner II"], slot: { type: "medium", index: 0 }, state: "active" },
        { type_id: types["Small Armor Repairer II"], slot: { type: "low", index: 0 }, state: "active" },
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Capacitor/ })).toHaveTextContent(/Depletes in \d\d:\d\d:\d\d$/);
    await expect(canvas.getByRole("group", { name: "Peak Recharge Minus Usage" })).toHaveTextContent(/^Δ -/);
  },
};
