import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { MaxVelocity } from "./MaxVelocity";

const types = {
  Rifter: 587,
  "5MN Y-T8 Compact Microwarpdrive": 5973,
  "1MN Afterburner II": 438,
};

const fitted = (typeId: number, state: "offline" | "active" | "overload") => ({
  args: { itemRef: 0, state },
  parameters: {
    fit: { ship: { type_id: types.Rifter }, items: [{ type_id: typeId, slot: { type: "medium", index: 0 }, state }] },
  },
});

const meta = {
  component: MaxVelocity,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MaxVelocity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Microwarpdrive: Story = {
  ...fitted(types["5MN Y-T8 Compact Microwarpdrive"], "active"),
  play: async ({ canvas }) => {
    const line = canvas.getByText("Max Velocity with: 3213.19 m/s");
    await expect(line).toBeVisible();
    await expect(line.querySelector("img")).toHaveAttribute("src", expect.stringMatching(/\.webp$/));
  },
};

export const OverheatedMicrowarpdrive: Story = {
  ...fitted(types["5MN Y-T8 Compact Microwarpdrive"], "overload"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity with: 4591.65 m/s")).toBeVisible();
  },
};

export const OfflineMicrowarpdrive: Story = {
  ...fitted(types["5MN Y-T8 Compact Microwarpdrive"], "offline"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity without: 456.25 m/s")).toBeVisible();
  },
};

export const Afterburner: Story = {
  ...fitted(types["1MN Afterburner II"], "active"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Max Velocity with: 1193.25 m/s")).toBeVisible();
  },
};
