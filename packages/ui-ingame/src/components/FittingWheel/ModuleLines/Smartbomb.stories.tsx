import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Smartbomb } from "./Smartbomb";

const types = {
  Rifter: 587,
  "Large EMP Smartbomb II": 3995,
};

const meta = {
  component: Smartbomb,
  args: { itemRef: 0, state: "active" },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [{ type_id: types["Large EMP Smartbomb II"], slot: { type: "high", index: 0 }, state: "active" }],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Smartbomb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Area of Effect Radius 6,000 m")).toBeVisible();
    await expect(canvas.getByText("300 HP - EM damage")).toBeVisible();
  },
};
