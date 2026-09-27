import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DefenseStats } from "./DefenseStats";

const meta = {
  component: DefenseStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof DefenseStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Defense/ })).toHaveTextContent("2,262 ehp");
    await expect(canvas.getByRole("group", { name: "Shield Hitpoints / Recharge Time" })).toHaveTextContent(
      "562 hp469 s",
    );
    await expect(canvas.getByRole("group", { name: "Armor Hitpoints" })).toHaveTextContent("562 hp");
    await expect(canvas.getByRole("group", { name: "Structure Hitpoints" })).toHaveTextContent("437 hp");
  },
};
