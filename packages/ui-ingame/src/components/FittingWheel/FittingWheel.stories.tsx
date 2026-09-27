import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";

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

export const ClickToSwitch: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, active");

    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, overload");
    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");

    await userEvent.keyboard("{Shift>}");
    await userEvent.click(afterburner());
    await userEvent.keyboard("{/Shift}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, overload");

    const damageControl = () => canvas.getByRole("button", { name: /^Damage Control II/ });
    await userEvent.click(damageControl());
    await expect(damageControl()).toHaveAccessibleName("Damage Control II, offline");
    await userEvent.click(damageControl());
    await expect(damageControl()).toHaveAccessibleName("Damage Control II, online");
  },
};

export const RigsStayOnline: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: /^Small Projectile Burst Aerator I/ })).toBeNull();
    const rig = within(canvas.getByRole("group", { name: "Small Projectile Burst Aerator I" }));
    await expect(rig.getByRole("button", { name: "Unfit Module" })).toBeInTheDocument();
    await expect(rig.queryByRole("button", { name: /^Put / })).toBeNull();
  },
};

/** Focused, as it only takes the pointer while its slot is hovered, which a test cannot do. */
function focusAction(canvas: ReturnType<typeof within>, module: string, action: string, nth = 0): HTMLElement {
  const group = canvas.getAllByRole("group", { name: module })[nth]!;
  const button = within(group).getByRole("button", { name: action });
  button.focus();
  return button;
}

export const Unfit: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    focusAction(canvas, "1MN Afterburner II", "Unfit Module");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("button", { name: /^1MN Afterburner II/ })).toBeNull();
    await expect(canvas.queryByRole("group", { name: "1MN Afterburner II" })).toBeNull();

    focusAction(canvas, "Small Projectile Burst Aerator I", "Unfit Module");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("group", { name: "Small Projectile Burst Aerator I" })).toBeNull();
  },
};

export const RemoveCharge: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement, userEvent }) => {
    focusAction(canvas, "200mm AutoCannon II", "Remove Charge");
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(0);
    await expect(canvas.queryByRole("button", { name: "Remove Charge" })).toBeNull();
    await expect(canvas.getAllByRole("button", { name: /^200mm AutoCannon II/ })).toHaveLength(2);
  },
};

export const PutOfflineAndOnline: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });

    focusAction(canvas, "1MN Afterburner II", "Put Offline");
    await userEvent.keyboard("{Enter}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");

    focusAction(canvas, "1MN Afterburner II", "Put Online");
    await userEvent.keyboard("{Enter}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, online");
  },
};
