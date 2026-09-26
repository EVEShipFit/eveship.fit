import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { TypeIcon } from "./TypeIcon";

const types = { Rifter: 587, "Damage Control II": 2048, "Hammerhead II": 2185, "Nanite Repair Paste": 28668 };
const sizes = [16, 20, 24, 32, 64, 128];

const meta = {
  component: TypeIcon,
  args: { typeId: types.Rifter },
} satisfies Meta<typeof TypeIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ship: Story = {};

export const Module: Story = {
  args: { typeId: types["Damage Control II"] },
  play: async ({ canvasElement }) => {
    const [icon, marker] = canvasElement.querySelectorAll("img");
    await waitFor(() => expect(icon?.naturalWidth).toBe(64));
    await waitFor(() => expect(marker?.naturalWidth).toBe(16));
  },
};

export const WithoutMarker: Story = {
  args: { typeId: types["Damage Control II"], marker: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("img")).toHaveLength(1);
  },
};

export const Drone: Story = {
  args: { typeId: types["Hammerhead II"] },
};

export const Item: Story = {
  args: { typeId: types["Nanite Repair Paste"] },
};

export const Small: Story = {
  args: { size: 16 },
};

export const Large: Story = {
  args: { size: 128 },
};

export const AllCombinations: Story = {
  render: () => (
    <div
      style={{
        alignItems: "end",
        display: "grid",
        gap: 12,
        gridTemplateColumns: `repeat(${sizes.length}, auto)`,
        justifyContent: "start",
      }}
    >
      {Object.entries(types).map(([name, typeId]) =>
        sizes.map((size) => <TypeIcon key={`${name}-${size}`} typeId={typeId} size={size} />),
      )}
    </div>
  ),
};
