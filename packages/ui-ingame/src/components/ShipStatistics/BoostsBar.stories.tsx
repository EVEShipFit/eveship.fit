import type { Fit } from "@eveshipfit/fitting";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ShipStatistics } from "./ShipStatistics";

const claymore: Fit = {
  name: "Shield Boosts",
  ship: { type_id: 22468 },
  items: [{ type_id: 43555, slot: { type: "high", index: 0 }, state: "active", charge: { type_id: 42695 } }],
};

const meta = {
  component: ShipStatistics,
  decorators: [(Story) => <div style={{ height: 640 }}>{Story()}</div>],
} satisfies Meta<typeof ShipStatistics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoBoosts: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("list", { name: "Boosts" })).toBeNull();
  },
};

/** Buffs from outside the fit, like a fleet in space, have no source to name. */
export const HandMadeBuffs: Story = {
  parameters: {
    fit: {
      ship: { type_id: 587 },
      items: [],
      incoming: {
        buffs: [
          { id: 10, value: -25.9 },
          { id: 60, value: -12.94 },
        ],
      },
    } satisfies Fit,
  },
  play: async ({ canvas, userEvent }) => {
    const boosts = within(canvas.getByRole("list", { name: "Boosts" }));
    await expect(boosts.getAllByRole("img").map((icon) => icon.getAttribute("aria-label"))).toEqual([
      "Shield Resistance Bonus +25.9 %",
      "Agility bonus +12.9 %",
    ]);
    await userEvent.hover(boosts.getByRole("img", { name: "Shield Resistance Bonus +25.9 %" }));
    await expect(canvas.getByText("+25.9 %")).toBeVisible();
  },
};

export const OwnBursts: Story = {
  parameters: { fit: claymore },
  play: async ({ canvas, userEvent }) => {
    const boosts = within(canvas.getByRole("list", { name: "Boosts" }));
    const buff = boosts.getByRole("img", { name: /^Shield Resistance Bonus \+[\d.]+ % from this fit$/ });
    await userEvent.hover(buff);
    await expect(canvas.getByText("Shield Resistance Bonus · from this fit")).toBeVisible();
  },
};

export const FromABooster: Story = {
  parameters: { fit: { ship: { type_id: 587 }, items: [], boosters: [{ fit: claymore }] } satisfies Fit },
  play: async ({ canvas }) => {
    const boosts = within(canvas.getByRole("list", { name: "Boosts" }));
    await expect(
      boosts.getByRole("img", { name: /^Shield Resistance Bonus \+[\d.]+ % from Shield Boosts$/ }),
    ).toBeVisible();
    const shieldEm = canvas.getByRole("meter", { name: "Shield EM Resistance" });
    await expect(within(shieldEm).getByText(/%$/)).toHaveAttribute("data-boosted");
    await expect(
      within(canvas.getByRole("meter", { name: "Armor EM Resistance" })).getByText(/%$/),
    ).not.toHaveAttribute("data-boosted");
  },
};
