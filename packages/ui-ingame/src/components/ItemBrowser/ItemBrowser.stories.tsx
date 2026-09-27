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

export const Filters: Story = {
  play: async ({ canvas }) => {
    const filters = [
      "Personal Fittings",
      "Corporation Fittings",
      "Alliance Fittings",
      "Community Fittings",
      "Current Hull",
      "Skills",
    ];
    for (const name of filters) {
      const filter = canvas.getByRole("button", { name });
      await expect(filter).toHaveAttribute("aria-pressed", "false");
      if (name === "Current Hull" || name === "Skills") await expect(filter).not.toHaveAttribute("aria-disabled");
      else await expect(filter).toHaveAttribute("aria-disabled", "true");
    }
  },
};

/** Current Hull keeps only the hull of the fit, with its groups open. */
export const CurrentHull: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    const filter = canvas.getByRole("button", { name: "Current Hull" });

    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);

    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "false");
    await waitFor(() => expect(hulls().getByRole("button", { name: "Battleship" })).toBeVisible());
    await expect(hulls().queryByRole("button", { name: "Rifter" })).toBeNull();
  },
};

/** Simulate Ship, or a double click on the hull, starts an empty fit of it. */
export const SimulateShip: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));

    await userEvent.click(hulls().getByRole("button", { name: "Simulate Slasher" }));
    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await expect(hulls().getByRole("button", { name: "Slasher" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);

    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await userEvent.dblClick(hulls().getByRole("button", { name: "Breacher" }));
    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await expect(hulls().getByRole("button", { name: "Breacher" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);
  },
};

const spaceshipCommand = 3327;
const minmatarFrigate = 3329;

/** Skills keeps the hulls the character can fly. */
export const Skills: Story = {
  parameters: { character: { skills: { [spaceshipCommand]: 1, [minmatarFrigate]: 1 } } },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(canvas.getByRole("button", { name: "Skills" }));
    await expect(canvas.getByRole("button", { name: "Skills" })).toHaveAttribute("aria-pressed", "true");
    await expect(hulls().queryByRole("button", { name: "Cruiser" })).toBeNull();

    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await expect(hulls().queryByRole("button", { name: /^Amarr/ })).toBeNull();
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Skills" }));
    await waitFor(() => expect(hulls().getByRole("button", { name: "Cruiser" })).toBeVisible());
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Item Browser" }).getBoundingClientRect().width).toBe(589.5);
  },
};
