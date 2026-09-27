import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { ShipStatistics } from "./ShipStatistics";

const meta = {
  component: ShipStatistics,
} satisfies Meta<typeof ShipStatistics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    const statistics = canvas.getByRole("region", { name: "Statistics" });
    await expect(statistics.getBoundingClientRect().width).toBe(280);
    const sections = canvas.getAllByRole("region").filter((region) => region !== statistics);
    await expect(sections.map((section) => section.getAttribute("aria-label"))).toEqual([
      "Capacitor",
      "Offense",
      "Defense",
      "Targeting",
      "Navigation",
      "Drones",
    ]);
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toHaveTextContent("0.0M ISK");
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Statistics" }).getBoundingClientRect().width).toBe(420);
  },
};

/** A stat shows EVE's tooltips of its attributes; one of two attributes shows both. */
export const Tooltips: Story = {
  play: async ({ canvas, userEvent }) => {
    const titles: Record<string, string[]> = {
      "Capacity / Recharge Time": ["Capacitor Capacity", "Capacitor Recharge Time"],
      "Shield Hitpoints / Recharge Time": ["Shield Capacity", "Shield Recharge Time"],
      "Armor Hitpoints": ["Armor Hitpoints"],
      "Structure Hitpoints": ["Structure Hitpoints"],
      "Sensor Strength": ["Ladar Sensor Strength"],
      "Scan Resolution": ["Scan Resolution"],
      "Signature Radius": ["Signature Radius"],
      "Maximum Locked Targets": ["Maximum Locked Targets"],
      Mass: ["Mass"],
      "Inertia Modifier": ["Inertia Modifier"],
      "Warp Speed": ["Ship Warp Speed"],
      "Drone Bandwidth": ["Drone Bandwidth"],
    };

    for (const [stat, expected] of Object.entries(titles)) {
      await userEvent.hover(canvas.getByRole("group", { name: stat }));
      for (const title of expected) {
        await expect(canvas.getByText(title)).toBeVisible();
      }
    }
  },
};
