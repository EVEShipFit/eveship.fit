import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CommandBonus } from "./CommandBonus";

const types = {
  Orca: 28606,
  "Mining Foreman Link - Laser Optimization II": 4276,
};

const meta = {
  component: CommandBonus,
  args: { itemRef: 0, typeId: types["Mining Foreman Link - Laser Optimization II"], state: "online" },
  parameters: {
    fit: {
      ship: { type_id: types.Orca },
      items: [
        {
          type_id: types["Mining Foreman Link - Laser Optimization II"],
          slot: { type: "high", index: 0 },
          state: "online",
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommandBonus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Command Bonus: -7.50%")).toBeVisible();
  },
};
