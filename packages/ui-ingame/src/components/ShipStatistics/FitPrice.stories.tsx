import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { FitPrice } from "./FitPrice";

const meta = {
  component: FitPrice,
  args: { price: 73_312_000 },
} satisfies Meta<typeof FitPrice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Priced: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toHaveTextContent("73.3M ISK");
  },
};

/** A preview that makes the fit more expensive. */
export const Pricier: Story = {
  args: { change: "worse" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toHaveAttribute("data-change", "worse");
  },
};

/** Hovering lists what the price adds up. */
export const Itemized: Story = {
  args: {
    price: 13_800_000,
    items: [
      { typeId: 2456, quantity: 5, price: 2_400_000 },
      { typeId: 2048, quantity: 1, price: 1_200_000 },
      { typeId: 587, quantity: 1, price: 600_000 },
      { typeId: 2185, quantity: 2, price: undefined },
    ],
  },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.hover(canvas.getByRole("group", { name: "Estimated Price" }));
    await expect(canvasElement).toHaveTextContent("Hobgoblin II5x12.0M ISK");
    await expect(canvasElement).toHaveTextContent("Rifter1x600,000 ISK");
    await expect(canvasElement).toHaveTextContent("Hammerhead II2x–");
  },
};

export const Unknown: Story = {
  args: { price: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toBeEmptyDOMElement();
  },
};

export const Free: Story = {
  args: { price: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Estimated Price" })).toHaveTextContent("0.0M ISK");
  },
};
