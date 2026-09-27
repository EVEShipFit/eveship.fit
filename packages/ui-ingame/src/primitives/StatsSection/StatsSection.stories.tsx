import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Stat } from "../Stat/Stat";
import { StatsSection } from "./StatsSection";

const meta = {
  component: StatsSection,
  args: {
    title: "Navigation",
    summary: "399.8 m/s",
    columns: 2,
    children: (
      <>
        <Stat icon="stat-mass" label="Mass">
          1,000.00 t
        </Stat>
        <Stat icon="stat-inertia" label="Inertia Modifier">
          1.3674x
        </Stat>
        <Stat icon="stat-warp-speed" label="Warp Speed">
          5.00 AU/s
        </Stat>
        <Stat icon="stat-align-time" label="Align Time">
          1.90s
        </Stat>
      </>
    ),
  },
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof StatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /Navigation/ })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("group", { name: "Mass" })).toHaveTextContent("1,000.00 t");
  },
};

export const Closes: Story = {
  play: async ({ canvas, userEvent }) => {
    const header = canvas.getByRole("button", { name: /Navigation/ });
    await userEvent.click(header);
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(header).toHaveTextContent("399.8 m/s");
    await waitFor(() => expect(canvas.queryByRole("group", { name: "Mass" })).toBeNull());

    await userEvent.click(header);
    await waitFor(() => expect(canvas.getByRole("group", { name: "Mass" })).toBeVisible());
  },
};

export const OneColumn: Story = {
  args: { columns: 1 },
};
