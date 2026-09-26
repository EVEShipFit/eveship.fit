import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Icon, iconNames } from "./Icon";

const sizes = [12, 16, 24, 32, 64];

const meta = {
  component: Icon,
  args: { name: "hardpoint-turret" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Turret: Story = {};

export const Launcher: Story = {
  args: { name: "hardpoint-launcher" },
};

export const HighSlot: Story = {
  args: { name: "slot-high" },
};

export const Large: Story = {
  args: { size: 64 },
};

export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        alignItems: "center",
        display: "grid",
        gap: 12,
        gridTemplateColumns: `auto repeat(${sizes.length}, auto)`,
        justifyContent: "start",
      }}
    >
      {iconNames.map((name) => [
        <span key={name}>{name}</span>,
        ...sizes.map((size) => <Icon key={`${name}-${size}`} name={name} size={size} />),
      ])}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of iconNames) {
      await expect(canvasElement.querySelectorAll(`[data-icon="${name}"]`)).toHaveLength(sizes.length);
    }
    for (const icon of canvasElement.querySelectorAll("img")) {
      await waitFor(() => expect(icon.naturalWidth).toBeGreaterThan(0));
    }
  },
};
