import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { BreacherPodLauncher } from "./BreacherPodLauncher";

const types = {
  Caracal: 621,
  "Medium Breacher Pod Launcher": 85085,
  "SCARAB Breacher Pod M": 85089,
};

const fitted = (chargeTypeId?: number) => ({
  args: { itemRef: 0, state: "active" as const },
  parameters: {
    fit: {
      ship: { type_id: types.Caracal },
      items: [
        {
          type_id: types["Medium Breacher Pod Launcher"],
          slot: { type: "high", index: 0 },
          state: "active",
          ...(chargeTypeId === undefined ? {} : { charge: { type_id: chargeTypeId } }),
        },
      ],
    },
  },
});

const meta = {
  component: BreacherPodLauncher,
  decorators: [
    (Story) => (
      <div style={{ background: "var(--esf-bg)", display: "grid", gap: 8, padding: "8px 14px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BreacherPodLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  ...fitted(types["SCARAB Breacher Pod M"]),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Range within 12 km")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
    await expect(canvas.getByText("Damage Per Second 750.0")).toBeVisible();
    await expect(canvas.getByText("Damage effect duration: 60s")).toBeVisible();
  },
};

export const Empty: Story = {
  ...fitted(),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Damage Per Second 0.0")).toBeVisible();
    await expect(canvas.queryByText(/^Range within/)).toBeNull();
    await expect(canvas.queryByText(/^Damage effect duration/)).toBeNull();
  },
};
