import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { DefenseStats } from "./DefenseStats";

const meta = {
  component: DefenseStats,
  decorators: [(Story) => <div style={{ width: 280 }}>{Story()}</div>],
} satisfies Meta<typeof DefenseStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Defense" })).toHaveAccessibleDescription("2,262 ehp");
    await expect(canvas.getByRole("group", { name: "Shield Hitpoints / Recharge Time" })).toHaveTextContent(
      "562 hp468 s",
    );
    await expect(canvas.getByRole("group", { name: "Armor Hitpoints" })).toHaveTextContent("562 hp");
    await expect(canvas.getByRole("group", { name: "Structure Hitpoints" })).toHaveTextContent("437 hp");

    const resistances = canvas.getAllByRole("meter", { name: /Resistance$/ }).map((meter) => meter.textContent);
    await expect(resistances).toEqual(
      [
        ["0 %", "20 %", "40 %", "50 %"],
        ["60 %", "35 %", "25 %", "10 %"],
        ["33 %", "33 %", "33 %", "33 %"],
      ].flat(),
    );
    const thermal = canvas.getByRole("meter", { name: "Shield Thermal Resistance" });
    await expect(Number(thermal.getAttribute("aria-valuenow"))).toBeCloseTo(0.2);
  },
};

export const Retribution: Story = {
  parameters: { fit: { ship: 11393 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Shield Hitpoints / Recharge Time" })).toHaveTextContent(
      "395 hp468 s",
    );
    await expect(canvas.getByRole("meter", { name: "Shield Explosive Resistance" })).toHaveTextContent("88 %");
  },
};

/** Millions above 100,000 hp. */
export const Rorqual: Story = {
  parameters: { fit: { ship: 28352 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Structure Hitpoints" })).toHaveTextContent(/^\d+\.\d\dM hp$/);
  },
};

export const PickARepairRate: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Passive shield recharge: 3 hp/s" }));
    await userEvent.click(canvas.getByRole("button", { name: "Armor repair rate" }));
    await expect(canvas.getByRole("button", { name: "Armor repair rate: No Module" })).toHaveTextContent("No Module");
    await expect(canvas.queryByRole("button", { name: "Hull repair rate" })).toBeNull();
  },
};

const shares = (canvas: { getAllByRole: (role: "meter", options: { name: RegExp }) => HTMLElement[] }) =>
  canvas.getAllByRole("meter", { name: /^Incoming/ }).map((meter) => Number(meter.getAttribute("aria-valuenow")));

export const MakeADamageProfile: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(shares(canvas)).toEqual([0.25, 0.25, 0.25, 0.25]);

    await userEvent.click(canvas.getByRole("button", { name: "Damage profile: Uniform" }));
    await userEvent.click(canvas.getByRole("button", { name: "New profile…" }));
    const dialog = within(canvas.getByRole("dialog"));
    await expect(dialog.getByRole("spinbutton", { name: "Kinetic" })).toHaveValue(25);
    await userEvent.type(dialog.getByRole("textbox", { name: "Name" }), "EM and Thermal");
    await userEvent.clear(dialog.getByRole("spinbutton", { name: "Kinetic" }));
    await userEvent.clear(dialog.getByRole("spinbutton", { name: "Explosive" }));
    await userEvent.click(dialog.getByRole("button", { name: "Save" }));

    await expect(canvas.getByRole("button", { name: "Damage profile: EM and Thermal" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Defense" })).toHaveAccessibleDescription("2,349 ehp");
    await expect(shares(canvas)).toEqual([0.5, 0.5, 0, 0]);
  },
};

export const PickADamageProfile: Story = {
  parameters: { damageProfiles: [{ name: "Thermal", profile: { em: 0, thermal: 1, kinetic: 0, explosive: 0 } }] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Damage profile: Uniform" }));
    await userEvent.click(canvas.getByRole("button", { name: "Thermal" }));
    await expect(canvas.getByRole("button", { name: "Defense" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("button", { name: "Defense" })).toHaveAccessibleDescription("2,221 ehp");

    await userEvent.click(canvas.getByRole("button", { name: "Damage profile: Thermal" }));
    await userEvent.click(canvas.getByRole("button", { name: "Edit Thermal" }));
    await userEvent.click(within(canvas.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    await expect(canvas.getByRole("button", { name: "Damage profile: Uniform" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Defense" })).toHaveAccessibleDescription("2,262 ehp");
  },
};
