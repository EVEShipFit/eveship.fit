import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ResistanceBar } from "./ResistanceBar";

const meta = {
  component: ResistanceBar,
  args: { damage: "em", label: "Shield EM Resistance", resistance: 0.37, children: "37 %" },
} satisfies Meta<typeof ResistanceBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Em: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("meter", { name: "Shield EM Resistance" });
    await expect(bar).toHaveTextContent("37 %");
    await expect(bar).toHaveAttribute("aria-valuenow", "0.37");
  },
};

export const Thermal: Story = {
  args: { damage: "thermal", resistance: 0.83, children: "83 %" },
};

export const Kinetic: Story = {
  args: { damage: "kinetic", resistance: 0.6, children: "60 %" },
};

export const Explosive: Story = {
  args: { damage: "explosive", resistance: 0, children: "0 %" },
};
