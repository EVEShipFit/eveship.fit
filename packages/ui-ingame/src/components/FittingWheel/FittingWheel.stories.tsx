import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { FittingWheel } from "./FittingWheel";

const types = {
  Rifter: 587,
  "200mm AutoCannon II": 2889,
  "EMP S": 185,
  "Rocket Launcher II": 10631,
  "1MN Afterburner II": 438,
  "Small Shield Extender II": 380,
  "Damage Control II": 2048,
  "Gyrostabilizer II": 519,
  "Small Projectile Burst Aerator I": 31668,
};

const rifter = {
  ship: { type_id: types.Rifter },
  items: [
    {
      type_id: types["200mm AutoCannon II"],
      slot: { type: "high", index: 0 },
      state: "active",
      charge: { type_id: types["EMP S"] },
    },
    { type_id: types["200mm AutoCannon II"], slot: { type: "high", index: 1 }, state: "overload" },
    { type_id: types["Rocket Launcher II"], slot: { type: "high", index: 2 }, state: "active" },
    { type_id: types["1MN Afterburner II"], slot: { type: "medium", index: 0 }, state: "active" },
    { type_id: types["Small Shield Extender II"], slot: { type: "medium", index: 1 }, state: "active" },
    { type_id: types["Damage Control II"], slot: { type: "low", index: 0 }, state: "active" },
    { type_id: types["Gyrostabilizer II"], slot: { type: "low", index: 1 }, state: "offline" },
    { type_id: types["Small Projectile Burst Aerator I"], slot: { type: "rig", index: 0 }, state: "active" },
  ],
};

const meta = {
  component: FittingWheel,
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "730px" } as CSSProperties}>{Story()}</div>],
} satisfies Meta<typeof FittingWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("region", { name: "Fitting" })).toBeInTheDocument();
    // A Rifter has 3 high, 3 medium and 4 low slots of 8 each, and 3 rig slots.
    await expect(canvasElement.querySelectorAll('[data-state="empty"]')).toHaveLength(13);
    await expect(canvasElement.querySelectorAll('[data-state="unavailable"]')).toHaveLength(14);
    await expect(canvas.getByRole("meter", { name: "Calibration" })).toHaveAttribute(
      "aria-valuetext",
      "0 / 400 points",
    );
  },
};

export const FittedRifter: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    const states = Array.from(canvasElement.querySelectorAll("[data-state]"), (slot) =>
      slot.getAttribute("data-state"),
    );
    await expect(states.filter((state) => state === "active")).toHaveLength(3);
    await expect(states.filter((state) => state === "overload")).toHaveLength(1);
    await expect(states.filter((state) => state === "online")).toHaveLength(3);
    await expect(states.filter((state) => state === "offline")).toHaveLength(1);
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(4);

    await expect(canvas.getByRole("meter", { name: "CPU" })).not.toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByRole("meter", { name: "Calibration" })).not.toHaveAttribute("aria-valuenow", "0");
  },
};
