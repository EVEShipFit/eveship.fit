import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";

import { FittingWindow } from "./FittingWindow";

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
  "Medium Projectile Burst Aerator I": 31670,
  "Nanite Repair Paste": 28668,
  "Hobgoblin II": 2456,
};

const rifter = {
  name: "Storybook Rifter",
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
    { type_id: types["Nanite Repair Paste"], slot: { type: "cargo" }, quantity: 30, state: "offline" },
  ],
};

/** One error: the rig size. Four warnings: cargo hold, drone bay, drone bandwidth and launched drones. */
const broken = {
  ...rifter,
  items: [
    ...rifter.items.filter((item) => item.slot.type !== "cargo"),
    { type_id: types["Medium Projectile Burst Aerator I"], slot: { type: "rig", index: 1 }, state: "active" },
    { type_id: types["Nanite Repair Paste"], slot: { type: "cargo" }, quantity: 20000, state: "offline" },
    { type_id: types["Hobgoblin II"], slot: { type: "drone_bay" }, quantity: 1, state: "active" },
  ],
};

const meta = {
  component: FittingWindow,
} satisfies Meta<typeof FittingWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    const { width, height } = window.getBoundingClientRect();
    await expect(width).toBe(700);
    await expect(height).toBe(630);

    await expect(canvas.getByRole("region", { name: "Fitting" })).toBeInTheDocument();
    await expect(canvas.getByText("Rifter")).toBeInTheDocument();
    await expect(canvas.queryByRole("img", { name: /^Fitting|^Missing/ })).toBeNull();
    await expect(canvas.getAllByRole("button", { name: /of 1$/ })).toHaveLength(1);
  },
};

export const FittedRifter: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Storybook Rifter")).toBeInTheDocument();
    await expect(canvas.getByText("CPU").parentElement).toHaveTextContent(/^CPU\d+\.\d\/\d+\.\d$/);
    await expect(canvas.getByText("Power Grid").parentElement).toHaveTextContent(/^Power Grid\d+\.\d\/\d+\.\d$/);
    await expect(canvas.getByRole("group", { name: "Cargo Hold" })).toHaveTextContent("0.3/140.0m3");
    await expect(canvas.getByRole("group", { name: "Drone Bay" })).toHaveTextContent("0.0/0.0m3");
  },
};

export const Broken: Story = {
  parameters: { fit: broken, character: { skills: {} } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: /^Missing Skills: \d+$/ })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Errors: 1" })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Warnings: 4" })).toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: "Cargo Hold" })).toHaveAttribute("data-over");
  },
};

export const History: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });

    await userEvent.click(afterburner());
    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("3 of 3");

    await userEvent.click(history.getByRole("button", { name: "1 of 3" }));
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, active");

    await userEvent.click(canvas.getByRole("button", { name: /^Damage Control II/ }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("4 of 4");
    await userEvent.click(history.getByRole("button", { name: "3 of 4" }));
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");
  },
};

export const AtUiScale150: Story = {
  parameters: { fit: rifter },
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect().width).toBe(1050);
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(858);
  },
};
