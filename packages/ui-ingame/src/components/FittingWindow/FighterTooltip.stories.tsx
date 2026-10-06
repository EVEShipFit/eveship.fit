import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FighterTooltip } from "./FighterTooltip";

const types = {
  Thanatos: 23911,
  "Einherji I": 23061,
  "Scarab I": 40345,
  Nyx: 23913,
  "Ametat I": 40362,
};

const squadron = (typeId: number, quantity: number, shipTypeId = types.Thanatos) => ({
  args: { itemRef: 0, typeId, quantity },
  parameters: {
    fit: {
      ship: { type_id: shipTypeId },
      items: [{ type_id: typeId, slot: { type: "fighter_tube", index: 0 }, quantity, state: "active" }],
    },
  },
});

const meta = {
  component: FighterTooltip,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FighterTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heavy: Story = {
  ...squadron(types["Einherji I"], 6),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("6x Einherji I")).toBeVisible();
    await expect(canvas.getByText("Autocannon - Damage Per Second 261.6")).toBeVisible();
    await expect(canvas.getByText("Falloff range within 15 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 5,000 m")).toBeVisible();
    await expect(canvas.getByText("Heavy Rocket Salvo - Damage Per Second 170.3")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 13 km")).toBeVisible();
    await expect(canvas.getByText("Maximum Targeting Range: 60 km")).toBeVisible();
    await expect(canvas.getByText("Scan Resolution: 700.0 mm")).toBeVisible();
    await expect(canvas.getByText("Signature Radius: 110.0 m")).toBeVisible();
  },
};

export const PartialSquadron: Story = {
  ...squadron(types["Einherji I"], 3),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3x Einherji I")).toBeVisible();
    await expect(canvas.getByText("Autocannon - Damage Per Second 130.8")).toBeVisible();
  },
};

export const Support: Story = {
  ...squadron(types["Scarab I"], 3),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3x Scarab I")).toBeVisible();
    await expect(canvas.getByText("Falloff range within 11 km")).toBeVisible();
    await expect(canvas.getByText("Optimal range within 5,000 m")).toBeVisible();
    await expect(canvas.queryByText(/Damage Per Second/)).toBeNull();
  },
};

/** The range of its micro jump drive is not shown. */
export const MicroJumpDrive: Story = {
  ...squadron(types["Ametat I"], 3, types.Nyx),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("3x Ametat I")).toBeVisible();
    await expect(canvas.getAllByText(/^Optimal range within /)).toHaveLength(1);
    await expect(canvas.queryByText("Optimal range within 100 km")).toBeNull();
  },
};

export const SingleFighter: Story = {
  ...squadron(types["Einherji I"], 1),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Einherji I")).toBeVisible();
    await expect(canvas.queryByText(/1x/)).toBeNull();
  },
};
