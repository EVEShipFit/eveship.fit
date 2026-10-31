import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { ShipBonuses } from "./ShipBonuses";

const BUZZARD = 11192;
const HECATE = 35683;
const HOBGOBLIN_II = 2456;

const meta = {
  component: ShipBonuses,
  args: { typeId: BUZZARD },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShipBonuses>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Per skill, the highest skill ID first as EVE does, then the role bonuses. */
export const Buzzard: Story = {
  play: async ({ canvas }) => {
    const covertOps = canvas.getByText("Covert Ops bonuses (per skill level):");
    const frigate = canvas.getByText("Caldari Frigate bonuses (per skill level):");
    await expect(covertOps.compareDocumentPosition(frigate)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await expect(canvas.getByText("Role Bonus:")).toBeVisible();
    await expect(canvas.getByText("10+")).toBeVisible();
    await expect(canvas.getByText("Cloaking Devices")).toHaveAttribute("data-bold");
  },
};

/** The modes of a Tactical Destroyer come as misc bonuses, with their own headers; too many to show at once. */
export const Hecate: Story = {
  args: { typeId: HECATE },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Misc bonus:")).toBeVisible();
    await expect(canvas.getByText("7.5%")).toBeVisible();
    await expect(canvas.getByText("Defense Mode", { selector: "[data-underline]" })).toHaveAttribute("data-bold");

    const list = canvas.getByText("Misc bonus:").parentElement!;
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  },
};

export const NoBonuses: Story = {
  args: { typeId: HOBGOBLIN_II },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Hobgoblin II")).toBeVisible();
    await expect(canvas.queryByText("Role Bonus:")).toBeNull();
  },
};

/** As the tooltip of the ship's Show Info button. */
export const InTooltip: Story = {
  args: { typeId: HECATE },
  decorators: [
    (Story) => (
      <div style={{ paddingTop: 720 }}>
        <Tooltip label={<Story />}>
          <button type="button">Show Info</button>
        </Tooltip>
      </div>
    ),
  ],
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "Show Info" }));
    await expect(canvas.getByText("Misc bonus:")).toBeVisible();
  },
};
