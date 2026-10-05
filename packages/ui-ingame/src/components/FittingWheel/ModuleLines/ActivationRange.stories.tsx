import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ActivationRange } from "./ActivationRange";

const types = {
  Claymore: 22468,
  Porpoise: 42244,
  Heron: 605,
  "Shield Command Burst II": 43555,
  "Mining Foreman Burst II": 43551,
  "Data Analyzer II": 30834,
  "Relic Analyzer II": 30832,
  Avatar: 11567,
  "Amarr Phenomena Generator": 43658,
  "Salvager I": 25861,
  "Entosis Link I": 34593,
};

const fitted = (
  typeId: number,
  slot: "high" | "medium" | "low",
  chargeTypeId?: number,
  shipTypeId = types.Claymore,
) => ({
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
  component: ActivationRange,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivationRange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommandBurst: Story = {
  ...fitted(types["Shield Command Burst II"], "high"),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 66 km")).toBeVisible();
  },
};

export const MiningBurst: Story = {
  ...fitted(types["Mining Foreman Burst II"], "high", undefined, types.Porpoise),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 41 km")).toBeVisible();
  },
};

export const DataAnalyzer: Story = {
  ...fitted(types["Data Analyzer II"], "medium", undefined, types.Heron),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 6,000 m")).toBeVisible();
  },
};

export const RelicAnalyzer: Story = {
  ...fitted(types["Relic Analyzer II"], "medium", undefined, types.Heron),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 6,000 m")).toBeVisible();
  },
};

export const Salvager: Story = {
  ...fitted(types["Salvager I"], "high", undefined, types.Heron),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 5,000 m")).toBeVisible();
  },
};

export const EntosisLink: Story = {
  ...fitted(types["Entosis Link I"], "high", undefined, types.Heron),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 20 km")).toBeVisible();
  },
};

export const PhenomenaGenerator: Story = {
  ...fitted(types["Amarr Phenomena Generator"], "high", undefined, types.Avatar),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 20,000 km")).toBeVisible();
  },
};
