import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

import { FilterToggle, type FilterToggleProps } from "./FilterToggle";

const meta = {
  component: FilterToggle,
  args: { icon: "current-hull", label: "Current Hull" },
} satisfies Meta<typeof FilterToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function Toggling(props: FilterToggleProps) {
  const [pressed, setPressed] = useState(false);
  return <FilterToggle {...props} pressed={pressed} onPressedChange={setPressed} />;
}

export const Toggle: Story = {
  render: (args) => <Toggling {...args} />,
  play: async ({ canvas, userEvent }) => {
    const filter = canvas.getByRole("button", { name: "Current Hull" });
    await expect(filter.getBoundingClientRect().width).toBe(32);
    await expect(filter).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "false");
  },
};

export const Pressed: Story = {
  args: { pressed: true, onPressedChange: () => {} },
};

/** A fitted module, by its own icon. */
export const WithType: Story = {
  args: { icon: undefined, typeId: 2889, label: "200mm AutoCannon II", pressed: true, onPressedChange: () => {} },
  play: async ({ canvas }) => {
    const filter = canvas.getByRole("button", { name: "200mm AutoCannon II" });
    await expect(filter.getBoundingClientRect().width).toBe(32);
    await expect(filter.querySelectorAll("img").length).toBeGreaterThan(1);
  },
};

export const NotImplemented: Story = {
  args: { icon: "fits-personal", label: "Personal Fittings" },
  play: async ({ canvas, userEvent }) => {
    const filter = canvas.getByRole("button", { name: "Personal Fittings" });
    await expect(filter).toHaveAttribute("aria-disabled", "true");

    await userEvent.hover(filter);
    await expect(canvas.getByText("Personal Fittings (not implemented yet)")).toBeVisible();
  },
};
