import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { ServiceSlot } from "./ServiceSlot";

const types = {
  "Standup Market Hub I": 35892,
};

const meta = {
  component: ServiceSlot,
  decorators: [(Story) => <div style={{ padding: "60px 20px 20px" }}>{Story()}</div>],
} satisfies Meta<typeof ServiceSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-state]")).toHaveAttribute("data-state", "empty");
    await expect(canvasElement.querySelector('[data-icon="slot-service"]')).toBeInTheDocument();
  },
};

export const Unavailable: Story = {
  args: { available: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-icon="slot-service"]')).toBeNull();
  },
};

export const Online: Story = {
  args: { typeId: types["Standup Market Hub I"] },
};

export const Offline: Story = {
  args: { typeId: types["Standup Market Hub I"], state: "offline" },
};

export const Preview: Story = {
  args: { typeId: types["Standup Market Hub I"], preview: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("fieldset")).toBeNull();
  },
};

/** Hovering or tabbing to the slot shows its actions above it, from the slot up: unfit, info and power. */
export const Actions: Story = {
  args: {
    typeId: types["Standup Market Hub I"],
    typeName: "Standup Market Hub I",
    label: "Standup Market Hub I, online",
    onPress: fn(),
    onUnfit: fn(),
    onTogglePower: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const actions = canvas.getByRole("group", { name: "Standup Market Hub I" });
    await expect(actions).not.toBeVisible();

    await userEvent.tab();
    await expect(actions).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledOnce();

    const top = (name: string) => canvas.getByRole("button", { name }).getBoundingClientRect().top;
    await expect(top("Put Offline")).toBeLessThan(top("Show Info"));
    await expect(top("Show Info")).toBeLessThan(top("Unfit Module"));

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Unfit Module" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onUnfit).toHaveBeenCalledOnce();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Put Offline" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onTogglePower).toHaveBeenCalledOnce();
  },
};
