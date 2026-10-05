import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TractorBeam } from "./TractorBeam";

const types = {
  Rifter: 587,
  "Small Tractor Beam II": 4250,
};

const meta = {
  component: TractorBeam,
  args: { itemRef: 0, typeId: types["Small Tractor Beam II"], state: "active" },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [{ type_id: types["Small Tractor Beam II"], slot: { type: "high", index: 0 }, state: "active" }],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TractorBeam>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 24 km")).toBeVisible();
    await expect(canvas.getByText("600 m/s Maximum Tractor Velocity")).toBeVisible();
  },
};
