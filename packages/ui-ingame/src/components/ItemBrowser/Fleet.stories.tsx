import type { Fit } from "@eveshipfit/fitting";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { ItemBrowser } from "./ItemBrowser";

const claymore: Fit = {
  name: "Shield Boosts",
  ship: { type_id: 22468 },
  items: [
    { type_id: 43555, slot: { type: "high", index: 0 }, state: "active", charge: { type_id: 42695 } },
    { type_id: 43555, slot: { type: "high", index: 1 }, state: "active", charge: { type_id: 42694 } },
  ],
};

const meta = {
  component: ItemBrowser,
  decorators: [(Story) => <div style={{ height: 592 }}>{Story()}</div>],
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Fleet" }));
  },
} satisfies Meta<typeof ItemBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async (context) => {
    await meta.play(context);
    const { canvas } = context;
    await expect(canvas.getByText("Add a fit with command bursts to boost this one.")).toBeVisible();
    await expect(canvas.queryByRole("switch", { name: "Boosts on" })).toBeNull();
  },
};

export const PasteABooster: Story = {
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("button", { name: "Paste booster fit…" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Paste Booster Fit" }));
    await userEvent.click(dialog.getByRole("textbox"));
    await userEvent.paste("[Claymore, Pasted]\nShield Command Burst II, Shield Harmonizing Charge\n");
    await userEvent.click(dialog.getByRole("button", { name: "Add" }));

    const card = within(canvas.getByRole("listitem", { name: "Pasted" }));
    await expect(card.getByText("Shield Harmonizing Charge")).toBeVisible();
    await expect(card.getByRole("switch", { name: "Boost from Pasted" })).toBeChecked();
  },
};

export const PasteSomethingElse: Story = {
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("button", { name: "Paste booster fit…" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Paste Booster Fit" }));
    await userEvent.type(dialog.getByRole("textbox"), "not a fit");
    await userEvent.click(dialog.getByRole("button", { name: "Add" }));
    await expect(dialog.getByRole("alert")).toHaveTextContent(/^Could not add: /);
  },
};

export const SwitchOffAndRemove: Story = {
  parameters: { fit: { ship: { type_id: 587 }, items: [], boosters: [{ fit: claymore }] } satisfies Fit },
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    const card = canvas.getByRole("listitem", { name: "Shield Boosts" });

    await userEvent.click(within(card).getByRole("switch", { name: "Boost from Shield Boosts" }));
    await expect(card).toHaveAttribute("data-status", "off");
    await expect(card).toHaveTextContent("Turned off");

    await userEvent.click(within(card).getByRole("button", { name: "Remove Shield Boosts" }));
    await expect(canvas.queryByRole("listitem", { name: "Shield Boosts" })).toBeNull();
  },
};

export const OfflineBurst: Story = {
  parameters: {
    fit: {
      ship: { type_id: 587 },
      items: [],
      boosters: [
        {
          fit: {
            ...claymore,
            items: claymore.items.map((item, index) => (index === 1 ? { ...item, state: "offline" } : item)),
          },
        },
      ],
    } satisfies Fit,
  },
  play: async (context) => {
    await meta.play(context);
    const card = within(context.canvas.getByRole("listitem", { name: "Shield Boosts" }));
    await expect(card.getByText("Active Shielding Charge").closest("li")).toHaveAttribute("data-off");
    await expect(card.getByText("offline")).toBeVisible();
    await expect(card.getByText("Shield Harmonizing Charge").closest("li")).not.toHaveAttribute("data-off");
  },
};

export const AllBoostsOff: Story = {
  parameters: { fit: { ship: { type_id: 587 }, items: [], boosters: [{ fit: claymore }] } satisfies Fit },
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("switch", { name: "Boosts on" }));
    await expect(canvas.getByRole("listitem", { name: "Shield Boosts" })).toHaveAttribute("data-status", "off");
    await expect(canvas.getByRole("switch", { name: "Boost from Shield Boosts" })).toBeChecked();
  },
};

export const PickFromMyFits: Story = {
  parameters: { localFits: [claymore, { name: "Kiter", ship: { type_id: 587 }, items: [] }] },
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("button", { name: "Pick from my fits" }));
    const list = within(await canvas.findByRole("list", { name: "Fits with command bursts" }));
    await expect(list.queryByRole("button", { name: /Kiter/ })).toBeNull();
    await userEvent.click(list.getByRole("button", { name: /Shield Boosts/ }));

    await expect(canvas.getByRole("listitem", { name: "Shield Boosts" })).toBeVisible();
  },
};

export const NothingToPick: Story = {
  play: async (context) => {
    await meta.play(context);
    const { canvas, userEvent } = context;
    await userEvent.click(canvas.getByRole("button", { name: "Pick from my fits" }));
    await expect(canvas.getByText(/None of your saved fits has a command burst/)).toBeVisible();
  },
};
