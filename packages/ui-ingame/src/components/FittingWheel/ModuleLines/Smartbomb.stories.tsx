import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import type { LineProps } from "./index";
import { Doomsday, Smartbomb } from "./Smartbomb";

const types = {
  Rifter: 587,
  "Large EMP Smartbomb II": 3995,
  Avatar: 11567,
  "'Judgment' Electromagnetic Doomsday": 24550,
  "'Holy Destiny' Electromagnetic Lance": 40631,
  "'Divine Harvest' Electromagnetic Reaper": 40632,
  "Bosonic Field Generator": 40633,
  "'Azmaru' Electromagnetic Disruptive Lance": 77399,
};

const doomsday = (typeId: number) => ({
  args: { typeId },
  parameters: {
    fit: {
      ship: { type_id: types.Avatar },
      items: [{ type_id: typeId, slot: { type: "high", index: 0 }, state: "active" }],
    },
  },
  render: (args: LineProps) => <Doomsday {...args} />,
});

const meta = {
  component: Smartbomb,
  args: { itemRef: 0, typeId: types["Large EMP Smartbomb II"], state: "active" },
  parameters: {
    fit: {
      ship: { type_id: types.Rifter },
      items: [{ type_id: types["Large EMP Smartbomb II"], slot: { type: "high", index: 0 }, state: "active" }],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Smartbomb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Area of Effect Radius 6,000 m")).toBeVisible();
    await expect(canvas.getByText("300 HP - EM damage")).toBeVisible();
  },
};

export const JudgmentDoomsday: Story = {
  args: { typeId: types["'Judgment' Electromagnetic Doomsday"] },
  parameters: {
    fit: {
      ship: { type_id: types.Avatar },
      items: [
        { type_id: types["'Judgment' Electromagnetic Doomsday"], slot: { type: "high", index: 0 }, state: "active" },
      ],
    },
  },
  render: (args) => <Doomsday {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("4,950,000 HP - EM damage")).toBeVisible();
  },
};

export const Lance: Story = {
  ...doomsday(types["'Holy Destiny' Electromagnetic Lance"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("103,125 HP - EM damage")).toBeVisible();
  },
};

export const Reaper: Story = {
  ...doomsday(types["'Divine Harvest' Electromagnetic Reaper"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("206,250 HP - EM damage")).toBeVisible();
  },
};

export const BosonicFieldGenerator: Story = {
  ...doomsday(types["Bosonic Field Generator"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("20,625 HP - EM damage")).toBeVisible();
    await expect(canvas.getByText("20,625 HP - Thermal damage")).toBeVisible();
    await expect(canvas.getByText("20,625 HP - Kinetic damage")).toBeVisible();
    await expect(canvas.getByText("20,625 HP - Explosive damage")).toBeVisible();
  },
};

export const DisruptiveLance: Story = {
  ...doomsday(types["'Azmaru' Electromagnetic Disruptive Lance"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("17,000 HP - EM damage")).toBeVisible();
  },
};
