import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CapacitorRing } from "./CapacitorRing";

const meta = {
  component: CapacitorRing,
  args: { capacity: 281, level: 0.36, label: "Stable at 36.0%" },
} satisfies Meta<typeof CapacitorRing>;

export default meta;
type Story = StoryObj<typeof meta>;

function litCells(column: Element) {
  return [...column.children].map((cell) => cell.hasAttribute("data-lit"));
}

export const PartlyLit: Story = {
  play: async ({ canvas }) => {
    const ring = canvas.getByRole("meter", { name: "Capacitor" });
    await expect(ring).toHaveAttribute("aria-valuetext", "Stable at 36.0%");
    await expect([...ring.children].map(litCells)).toEqual([
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, true, true],
      [true, true, true],
    ]);
  },
};

export const Full: Story = {
  args: { level: 1, label: "Stable at 100.0%" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-lit]")).toHaveLength(15);
  },
};

export const Depletes: Story = {
  args: { level: 0, label: "Depletes in 00:01:23" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-lit]")).toHaveLength(0);
  },
};

export const Small: Story = {
  args: { capacity: 120, level: 0.5, label: "Stable at 50.0%" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("meter").children).toHaveLength(2);
  },
};

export const Large: Story = {
  args: { capacity: 1200, level: 0.7, label: "Stable at 70.0%" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("meter").children).toHaveLength(10);
  },
};
