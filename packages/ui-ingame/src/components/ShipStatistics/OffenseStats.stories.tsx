import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { OffenseStats } from "./OffenseStats";

const types = {
  Rifter: 587,
  "200mm AutoCannon II": 2889,
  "EMP S": 185,
};

const autoCannon = (index: number) => ({
  type_id: types["200mm AutoCannon II"],
  slot: { type: "high", index },
  state: "active",
  charge: { type_id: types["EMP S"] },
});

const meta = {
  component: OffenseStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof OffenseStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoWeapons: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Offense/ })).toHaveTextContent("0.0 dps");
    await expect(canvas.getByRole("group", { name: "Damage per Second" })).toHaveTextContent(/^0\.0 dps$/);
    await expect(canvas.getByRole("group", { name: "Alpha Strike" })).toHaveTextContent("0 HP");
  },
};

/** With reload, the dps is lower, so it shows in (). */
export const Guns: Story = {
  parameters: { fit: { ship: { type_id: types.Rifter }, items: [autoCannon(0), autoCannon(1)] } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Damage per Second" })).toHaveTextContent(
      /^[\d.]+ dps \([\d.]+ dps\)$/,
    );
  },
};
