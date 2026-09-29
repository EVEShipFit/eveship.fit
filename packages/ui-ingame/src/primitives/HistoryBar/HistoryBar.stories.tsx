import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { expect, fn } from "storybook/test";

import { HistoryBar, type HistoryBarProps } from "./HistoryBar";

const meta = {
  component: HistoryBar,
  args: { label: "Simulation History", length: 9, position: 8, onGoTo: fn() },
} satisfies Meta<typeof HistoryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AtTheLatest: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Simulation History" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "9 of 9" })).toHaveAttribute("aria-current", "true");
    await expect(canvas.getByRole("button", { name: "Forward" })).toBeDisabled();
  },
};

export const Inline: Story = {
  args: { inline: true },
  play: async ({ canvas }) => {
    const title = canvas.getByText("Simulation History").getBoundingClientRect();
    const bar = canvas.getByRole("button", { name: "1 of 9" }).parentElement!.getBoundingClientRect();
    await expect(bar.left).toBeGreaterThan(title.right);
  },
};

export const WentBack: Story = {
  args: { position: 3 },
};

export const OnlyOne: Story = {
  args: { length: 1, position: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Back" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Forward" })).toBeDisabled();
  },
};

export const Full: Story = {
  args: { length: 25, position: 24 },
  play: async ({ canvas }) => {
    const bar = canvas.getByRole("button", { name: "1 of 25" }).parentElement!.getBoundingClientRect();
    const last = canvas.getByRole("button", { name: "25 of 25" }).getBoundingClientRect();
    await expect(last.right).toBeLessThanOrEqual(bar.right);
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
};

function Stepping(props: HistoryBarProps) {
  const [position, setPosition] = useState(props.position);
  return <HistoryBar {...props} position={position} onGoTo={setPosition} />;
}

export const StepThrough: Story = {
  render: (args) => <Stepping {...args} />,
  play: async ({ canvas, userEvent }) => {
    const current = () => canvas.getByRole("button", { current: true });

    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(current()).toHaveAccessibleName("8 of 9");
    await userEvent.click(canvas.getByRole("button", { name: "2 of 9" }));
    await expect(current()).toHaveAccessibleName("2 of 9");
    await userEvent.click(canvas.getByRole("button", { name: "Forward" }));
    await expect(current()).toHaveAccessibleName("3 of 9");
  },
};
