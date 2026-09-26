import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { Wheel } from "./Wheel";

const meta = {
  component: Wheel,
  args: { label: "Fitting" },
} satisfies Meta<typeof Wheel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    const { width, height } = wheel.getBoundingClientRect();
    await expect(width).toBe(480);
    await expect(height).toBe(width);
  },
};

export const Small: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "240px" } as CSSProperties}>{Story()}</div>],
};

export const Large: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "730px" } as CSSProperties}>{Story()}</div>],
};

export const FillsItsContainer: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "100%", width: 360 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(360);
  },
};

/** The rings are black and partly see-through, so they show best on top of the ship. */
export const OnABackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "radial-gradient(circle, #7a4a4a, #2a1a1f 70%)", width: "fit-content" }}>{Story()}</div>
    ),
  ],
};
