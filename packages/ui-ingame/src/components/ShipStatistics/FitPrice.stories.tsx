import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

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
