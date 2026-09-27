import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, waitFor, within } from "storybook/test";

import { ItemBrowser } from "./ItemBrowser";

const meta = {
  component: ItemBrowser,
  decorators: [(Story) => <div style={{ height: 595 }}>{Story()}</div>],
} satisfies Meta<typeof ItemBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HullsAndFits: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Item Browser" }).getBoundingClientRect().width).toBe(393);
    await expect(canvas.getByRole("tab", { name: "Hulls & Fits" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Modules" })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("tab", { name: "Charges" })).toHaveAttribute("aria-disabled", "true");

    const hulls = within(canvas.getByRole("list", { name: "Hulls" }));
    await expect(hulls.getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");
    await expect(hulls.queryByRole("button", { name: /^Minmatar/ })).toBeNull();
  },
};

export const Browse: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar \[\d+\]$/ }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Collapse All Groups" }));
    await expect(hulls().getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");
    await expect(hulls().queryByRole("button", { name: "Rifter" })).toBeNull();
  },
};

/** Search opens every group with a match, and drops the rest. */
export const Search: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "rifter");

    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();
    await expect(hulls().getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "true");
    await expect(hulls().getByRole("button", { name: "Minmatar [1]" })).toHaveAttribute("aria-expanded", "true");
    await expect(hulls().queryByRole("button", { name: "Battleship" })).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Collapse All Groups" }));
    await expect(hulls().getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");

    await userEvent.clear(canvas.getByRole("searchbox", { name: "Search" }));
    await waitFor(() => expect(hulls().getByRole("button", { name: "Battleship" })).toBeVisible());
    await expect(hulls().queryByRole("button", { name: "Rifter" })).toBeNull();
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Item Browser" }).getBoundingClientRect().width).toBe(589.5);
  },
};
