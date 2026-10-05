import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ProbeLauncher } from "./ProbeLauncher";

const types = {
  Helios: 11172,
  "Core Probe Launcher II": 4258,
  "Core Scanner Probe I": 30013,
};

const fitted = (typeId: number, slot: "high" | "medium" | "low", chargeTypeId?: number, shipTypeId = types.Helios) => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: shipTypeId },
      items: [
        {
          type_id: typeId,
          slot: { type: slot, index: 0 },
          state: "active",
          ...(chargeTypeId === undefined ? {} : { charge: { type_id: chargeTypeId } }),
        },
      ],
    },
  },
});

const meta = {
  component: ProbeLauncher,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProbeLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  ...fitted(types["Core Probe Launcher II"], "high", types["Core Scanner Probe I"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
    await expect(canvas.getByText("Base Sensor Strength: 98 points")).toBeVisible();
  },
};

export const Empty: Story = {
  ...fitted(types["Core Probe Launcher II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 0")).toBeVisible();
    await expect(canvas.queryByText(/Base Sensor Strength/)).toBeNull();
  },
};
