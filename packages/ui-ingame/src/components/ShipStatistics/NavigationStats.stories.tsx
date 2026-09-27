import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { NavigationStats } from "./NavigationStats";

const meta = {
  component: NavigationStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof NavigationStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /^Navigation/ })).toHaveTextContent("456.2 m/s");
    await expect(canvas.getByRole("group", { name: "Mass" })).toHaveTextContent("1,067.00 t");
    await expect(canvas.getByRole("group", { name: "Inertia Modifier" })).toHaveTextContent("2.1601x");
    await expect(canvas.getByRole("group", { name: "Warp Speed" })).toHaveTextContent("5.00 AU/s");
    await expect(canvas.getByRole("group", { name: "Align Time" })).toHaveTextContent("3.20s");
  },
};
