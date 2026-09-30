import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { FighterTube } from "./FighterTube";

const types = {
  "Templar II": 40556,
  "Antaeus II": 40562,
};

const meta = {
  component: FighterTube,
  args: { index: 0 },
  decorators: [(Story) => <div style={{ padding: 20 }}>{Story()}</div>],
} satisfies Meta<typeof FighterTube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Tube 1" })).toHaveTextContent("1Open");
  },
};

export const Unavailable: Story = {
  args: { index: 4, available: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Tube 5" })).toHaveTextContent(/^5$/);
  },
};

export const FullSquadron: Story = {
  args: {
    typeId: types["Templar II"],
    typeName: "Templar II",
    quantity: 6,
    size: 6,
    role: "fighter-role-attack",
    onRemove: fn(),
    onResize: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("meter", { name: "Fighters" })).toHaveAttribute("aria-valuetext", "6 of 6");
    await expect(canvas.getByRole("button", { name: "One more Templar II" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "One fewer Templar II" }));
    await expect(args.onResize).toHaveBeenCalledWith(5);
    await userEvent.click(canvas.getByRole("button", { name: "Remove Templar II" }));
    await expect(args.onRemove).toHaveBeenCalledOnce();
  },
};

export const PartialSquadron: Story = {
  args: {
    typeId: types["Antaeus II"],
    typeName: "Antaeus II",
    quantity: 3,
    size: 6,
    role: "fighter-role-bomber",
    onRemove: fn(),
    onResize: fn(),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("path[data-lit]")).toHaveLength(3);
    await expect(canvasElement.querySelectorAll("path")).toHaveLength(6);
  },
};

/** What a hovered fighter would launch; it cannot be changed yet. */
export const Preview: Story = {
  args: { ...FullSquadron.args, preview: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};
