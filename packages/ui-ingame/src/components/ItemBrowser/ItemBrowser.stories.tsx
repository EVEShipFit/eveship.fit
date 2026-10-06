import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, spyOn, waitFor, within } from "storybook/test";

import { ItemBrowser } from "./ItemBrowser";

const localFits = [
  { name: "Kiter", ship: { type_id: 587 }, items: [] },
  {
    name: "Brawler",
    ship: { type_id: 587 },
    items: [{ type_id: 2048, slot: { type: "low", index: 0 }, state: "active" }],
  },
  { name: "Tackle", ship: { type_id: 585 }, items: [] },
];

const meta = {
  component: ItemBrowser,
  decorators: [(Story) => <div style={{ height: 592 }}>{Story()}</div>],
} satisfies Meta<typeof ItemBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HullsAndFits: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Item Browser" }).getBoundingClientRect().width).toBe(393);
    await expect(canvas.getByRole("tab", { name: "Hulls & Fits" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Modules" })).toHaveAttribute("aria-selected", "false");
    await expect(canvas.getByRole("tab", { name: "Modules" })).not.toHaveAttribute("aria-disabled");
    await expect(canvas.getByRole("tab", { name: "Charges" })).toHaveAttribute("aria-selected", "false");

    const hulls = within(canvas.getByRole("list", { name: "Hulls" }));
    await expect(hulls.getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");
    await expect(hulls.queryByRole("button", { name: /^Minmatar/ })).toBeNull();
  },
};

export const Browse: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await expect(
      hulls()
        .getByRole("button", { name: /^Minmatar/ })
        .querySelector("img"),
    ).not.toBeNull();
    await expect(
      hulls()
        .getByRole("button", { name: /^Non-Empire/ })
        .querySelector("img"),
    ).not.toBeNull();
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar \[\d+\]$/ }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Collapse All Groups" }));
    await expect(hulls().getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");
    await expect(hulls().queryByRole("button", { name: "Rifter" })).toBeNull();
  },
};

export const BrowseStructures: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Citadel" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Non-Empire \[\d+\]$/ }));
    await expect(hulls().getByRole("button", { name: "Astrahus" })).toBeVisible();
  },
};

/** Search keeps every group with a match, closed, and drops the rest. */
export const Search: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "rifter");

    await expect(hulls().getByRole("button", { name: "Frigate" })).toHaveAttribute("aria-expanded", "false");
    await expect(hulls().queryByRole("button", { name: "Battleship" })).toBeNull();
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: "Minmatar [1]" }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();

    await userEvent.clear(canvas.getByRole("searchbox", { name: "Search" }));
    await waitFor(() => expect(hulls().getByRole("button", { name: "Battleship" })).toBeVisible());
  },
};

export const Filters: Story = {
  play: async ({ canvas }) => {
    const filters = [
      "Browser Fittings",
      "Personal Fittings",
      "Corporation Fittings",
      "Alliance Fittings",
      "Community Fittings",
      "Current Hull",
      "Skills",
    ];
    for (const name of filters) {
      const filter = canvas.getByRole("button", { name });
      await expect(filter).toHaveAttribute("aria-pressed", "false");
      if (["Browser Fittings", "Personal Fittings", "Current Hull", "Skills"].includes(name)) {
        await expect(filter).not.toHaveAttribute("aria-disabled");
      } else {
        await expect(filter).toHaveAttribute("aria-disabled", "true");
      }
    }
  },
};

/** Current Hull keeps only the hull of the fit. */
export const CurrentHull: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    const filter = canvas.getByRole("button", { name: "Current Hull" });

    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await expect(hulls().queryByRole("button", { name: "Battleship" })).toBeNull();
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);

    await userEvent.click(filter);
    await expect(filter).toHaveAttribute("aria-pressed", "false");
    await waitFor(() => expect(hulls().getByRole("button", { name: "Battleship" })).toBeVisible());
  },
};

/** Simulate Ship starts an empty fit of the hull; a double click does not. */
export const SimulateShip: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));

    await userEvent.click(hulls().getByRole("button", { name: "Simulate Slasher" }));
    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await expect(hulls().getByRole("button", { name: "Slasher" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);

    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await userEvent.dblClick(hulls().getByRole("button", { name: "Breacher" }));
    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));
    await expect(hulls().getByRole("button", { name: "Slasher" })).toBeVisible();
    await expect(hulls().getAllByRole("button", { name: /^Simulate / })).toHaveLength(1);
  },
};

const spaceshipCommand = 3327;
const minmatarFrigate = 3329;

/** Skills keeps the hulls the character can fly. */
export const Skills: Story = {
  parameters: { character: { skills: { [spaceshipCommand]: 1, [minmatarFrigate]: 1 } } },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(canvas.getByRole("button", { name: "Skills" }));
    await expect(canvas.getByRole("button", { name: "Skills" })).toHaveAttribute("aria-pressed", "true");
    await expect(hulls().queryByRole("button", { name: "Cruiser" })).toBeNull();

    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await expect(hulls().queryByRole("button", { name: /^Amarr/ })).toBeNull();
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Skills" }));
    await waitFor(() => expect(hulls().getByRole("button", { name: "Cruiser" })).toBeVisible());
  },
};

/** A hull with fits saved in the browser opens to them by name, and counts them. */
export const SavedFits: Story = {
  parameters: { localFits },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));

    const rifter = hulls().getByRole("button", { name: "Rifter" });
    await expect(rifter).toHaveAccessibleDescription(
      "Browser Fittings: 2 Personal Fittings: 0 Corporation Fittings: 0 Community Fittings: 0 Alliance Fittings: 0",
    );
    await expect(hulls().getByRole("button", { name: "Simulate Rifter" })).toBeVisible();

    await userEvent.click(rifter);
    const [first, second] = hulls().getAllByRole("button", { name: /^(Brawler|Kiter)$/ });
    await expect(first).toHaveAccessibleName("Brawler");
    await expect(second).toHaveAccessibleName("Kiter");
    await expect(hulls().getAllByRole("img", { name: "Can fly" })).toHaveLength(2);
    await expect(hulls().getByRole("button", { name: "Breacher" })).not.toHaveAccessibleDescription();
  },
};

/** A hull without fits opens to No Item. */
export const NoFits: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));

    await userEvent.click(hulls().getByRole("button", { name: "Rifter" }));
    await expect(hulls().getByRole("button", { name: "Rifter" })).toHaveAttribute("aria-expanded", "true");
    await expect(hulls().getByRole("button", { name: "No Item" })).toBeVisible();
  },
};

/** Browser Fittings keeps the hulls with a fit saved in the browser. */
export const BrowserFittings: Story = {
  parameters: { localFits },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(canvas.getByRole("button", { name: "Browser Fittings" }));
    await expect(hulls().queryByRole("button", { name: "Cruiser" })).toBeNull();

    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await expect(hulls().getByRole("button", { name: /^Rifter/ })).toBeVisible();
    await expect(hulls().getByRole("button", { name: /^Slasher/ })).toBeVisible();
    await expect(hulls().queryByRole("button", { name: /^Breacher/ })).toBeNull();
  },
};

/** Current Hull keeps the hull of the fit under Browser Fittings, even without fits. */
export const CurrentHullWithoutFits: Story = {
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(canvas.getByRole("button", { name: "Browser Fittings" }));
    await userEvent.click(canvas.getByRole("button", { name: "Current Hull" }));

    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(hulls().getByRole("button", { name: "Rifter" }));
    await expect(hulls().getByRole("button", { name: "No Item" })).toBeVisible();
  },
};

/** Personal Fittings without a logged-in character asks to log in. */
export const PersonalFittings: Story = {
  parameters: { localFits },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Personal Fittings" }));
    await expect(canvas.getByText("Pick a logged-in character")).toBeVisible();
    await expect(within(canvas.getByRole("list", { name: "Hulls" })).queryByRole("button")).toBeNull();
  },
};

/** Search finds fits by their name too. */
export const SearchFits: Story = {
  parameters: { localFits },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "kiter");
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(hulls().getByRole("button", { name: "Rifter" }));

    await expect(hulls().getByRole("button", { name: "Kiter" })).toBeVisible();
    await expect(hulls().queryByRole("button", { name: "Brawler" })).toBeNull();
  },
};

/** A fit the character cannot fly gets a red cross; with Skills on, it is left out. */
export const MissingSkills: Story = {
  parameters: { localFits, character: { skills: { [spaceshipCommand]: 1, [minmatarFrigate]: 1 } } },
  play: async ({ canvas, userEvent }) => {
    const hulls = () => within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "rifter");
    await userEvent.click(hulls().getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls().getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(hulls().getByRole("button", { name: "Rifter" }));
    await expect(hulls().getByRole("img", { name: "Can fly" })).toBeVisible();
    await expect(hulls().getByRole("img", { name: /^Missing skills: \d+$/ })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Skills" }));
    await expect(hulls().getByRole("button", { name: "Kiter" })).toBeVisible();
    await expect(hulls().queryByRole("button", { name: "Brawler" })).toBeNull();
  },
};

const modules = (canvas: ReturnType<typeof within>) => within(canvas.getByRole("list", { name: "Modules" }));

/** The Modules tab keeps its own search and filters, next to those of Hulls & Fits. */
/** Save keeps the fit in the browser, under its hull; a fit without a name is named first. */
export const SaveFit: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    let dialog = within(canvas.getByRole("dialog", { name: "Save Fit" }));
    await expect(dialog.getByRole("textbox")).toHaveValue("Rifter");
    await expect(dialog.getByRole("textbox")).toHaveFocus();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    dialog = within(canvas.getByRole("dialog", { name: "Save Fit" }));
    await userEvent.clear(dialog.getByRole("textbox"));
    await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();
    await userEvent.type(dialog.getByRole("textbox"), "My Rifter{Enter}");
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Saved" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Saved" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Browser Fittings" }));
    const hulls = within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls.getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls.getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(hulls.getByRole("button", { name: "Rifter" }));
    await expect(hulls.getByRole("button", { name: "My Rifter" })).toBeVisible();
  },
};

/** Saving over a different fit with the same hull and name asks first. */
export const OverwriteFit: Story = {
  parameters: { localFits, fit: { name: "Brawler", ship: { type_id: 587 }, items: [] } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Overwrite Fit?" }));
    await expect(dialog.getByText(/"Brawler"/)).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Save" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.click(canvas.getByRole("button", { name: "Overwrite" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Saved" })).toBeVisible();
  },
};

/** Naming a fit after its hull asks before overwriting one saved under that name; Cancel leaves it unnamed. */
export const OverwriteUnnamedFit: Story = {
  parameters: {
    localFits: [
      {
        name: "Rifter",
        ship: { type_id: 587 },
        items: [{ type_id: 2048, slot: { type: "low", index: 0 }, state: "active" }],
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const nameAndSave = async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Save" }));
      await userEvent.click(
        within(canvas.getByRole("dialog", { name: "Save Fit" })).getByRole("button", { name: "Save" }),
      );
      return within(canvas.getByRole("dialog", { name: "Overwrite Fit?" }));
    };
    let dialog = await nameAndSave();
    await expect(dialog.getByText(/"Rifter"/)).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));

    dialog = await nameAndSave();
    await userEvent.click(dialog.getByRole("button", { name: "Overwrite" }));

    await userEvent.click(canvas.getByRole("button", { name: "Browser Fittings" }));
    const hulls = within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls.getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls.getByRole("button", { name: /^Minmatar/ }));
    await expect(hulls.getByRole("button", { name: "Rifter" })).toHaveAccessibleDescription(/^Browser Fittings: 1 /);
  },
};

/** The copy menu puts the fit on the clipboard as EFT or esf/1 text. */
export const CopyFit: Story = {
  play: async ({ canvas, userEvent }) => {
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue();

    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await userEvent.click(canvas.getByRole("menuitem", { name: "Copy as EFT" }));
    await expect(writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^\[Rifter, /));
    await expect(canvas.queryByRole("menu")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await userEvent.click(canvas.getByRole("menuitem", { name: "Copy as esf/1" }));
    await expect(writeText).toHaveBeenLastCalledWith(expect.stringMatching(/^%esf\/1\nRifter/));
  },
};

/** Import starts from what is on the clipboard, and replaces the fit with it. */
export const ImportFit: Story = {
  play: async ({ canvas, userEvent }) => {
    spyOn(navigator.clipboard, "readText").mockResolvedValue("[Slasher, Imported]\n200mm AutoCannon II");

    await userEvent.click(canvas.getByRole("button", { name: "Import…" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Import Fit" }));
    await waitFor(() => expect(dialog.getByRole("textbox")).toHaveValue("[Slasher, Imported]\n200mm AutoCannon II"));
    await userEvent.click(dialog.getByRole("button", { name: "Import" }));
    await expect(canvas.queryByRole("dialog")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await userEvent.type(canvas.getByRole("searchbox"), "imported");
    const hulls = within(canvas.getByRole("list", { name: "Hulls" }));
    await userEvent.click(hulls.getByRole("button", { name: "Frigate" }));
    await userEvent.click(hulls.getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(hulls.getByRole("button", { name: "Slasher" }));
    await expect(hulls.getByRole("button", { name: "Imported" })).toBeVisible();
  },
};

/** A fit that does not import says why, and keeps the text to fix it. */
export const ImportError: Story = {
  play: async ({ canvas, userEvent }) => {
    spyOn(navigator.clipboard, "readText").mockRejectedValue(new Error("Denied"));

    await userEvent.click(canvas.getByRole("button", { name: "Import…" }));
    const dialog = within(canvas.getByRole("dialog", { name: "Import Fit" }));
    const text = dialog.getByRole("textbox");
    await expect(text).toHaveValue("");
    await expect(dialog.getByRole("button", { name: "Import" })).toBeDisabled();

    await userEvent.click(text);
    await userEvent.paste("[Rifter, Broken]\nDamage Contrl II");
    await userEvent.click(dialog.getByRole("button", { name: "Import" }));
    await expect(dialog.getByRole("alert")).toHaveTextContent("Could not import: unknown type Damage Contrl II");
    await expect(text).toHaveValue("[Rifter, Broken]\nDamage Contrl II");

    await userEvent.type(text, " ");
    await expect(dialog.queryByRole("alert")).toBeNull();
  },
};

export const Modules: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await expect(canvas.getByRole("tab", { name: "Modules" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Hulls & Fits" })).toHaveAttribute("aria-selected", "false");
    await expect(canvas.queryByRole("list", { name: "Hulls" })).toBeNull();
    await expect(modules(canvas).getByRole("button", { name: "Hull & Armor" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    const panel = within(canvas.getByRole("tabpanel"));
    const filterButtons = within(panel.getByRole("group", { name: "Filters" }));
    const filters = [
      "Low Slot",
      "Mid Slot",
      "High Slot",
      "Rig & Subsystem Slots",
      "Drones",
      "Hull Restrictions",
      "Resources",
      "Skills",
    ];
    for (const name of filters) {
      const filter = filterButtons.getByRole("button", { name });
      await expect(filter).toHaveAttribute("aria-pressed", "false");
      if (name === "Resources") await expect(filter).toHaveAttribute("aria-disabled", "true");
      else await expect(filter).not.toHaveAttribute("aria-disabled");
    }

    await userEvent.type(panel.getByRole("searchbox", { name: "Search" }), "damage control");
    await userEvent.click(canvas.getByRole("tab", { name: "Hulls & Fits" }));
    await expect(within(canvas.getByRole("tabpanel")).getByRole("searchbox", { name: "Search" })).toHaveValue("");
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await expect(within(canvas.getByRole("tabpanel")).getByRole("searchbox", { name: "Search" })).toHaveValue(
      "damage control",
    );
  },
};

/** Modules are sorted as EVE does, with faction ones in a folder of their own. */
export const BrowseModules: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.click(modules(canvas).getByRole("button", { name: "Hull & Armor" }));
    await userEvent.click(modules(canvas).getByRole("button", { name: "Remote Armor Repairers" }));
    await userEvent.click(modules(canvas).getByRole("button", { name: "Large" }));

    const large = modules(canvas)
      .getAllByRole("button", { name: /^Large .*Remote Armor Repairer/ })
      .map((row) => row.textContent);
    await expect(large).toEqual([
      "Large Ancillary Remote Armor Repairer",
      "Large Remote Armor Repairer I",
      "Large Coaxial Compact Remote Armor Repairer",
      "Large I-ax Enduring Remote Armor Repairer",
      "Large Solace Scoped Remote Armor Repairer",
      "Large Remote Armor Repairer II",
    ]);
    await expect(modules(canvas).getByRole("button", { name: "Faction & Storyline" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(
      modules(canvas).getByRole("button", { name: "Show Info on Large Remote Armor Repairer I" }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

export const SearchModules: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(within(canvas.getByRole("tabpanel")).getByRole("searchbox"), "damage control ii");

    await expect(modules(canvas).getByRole("button", { name: "Damage Control II" })).toBeVisible();
    await expect(modules(canvas).queryByRole("button", { name: "Damage Control I" })).toBeNull();
    await expect(modules(canvas).queryByRole("button", { name: "Ship Equipment" })).toBeNull();
  },
};

/** Search results by root market group, each a flat list sorted by name. */
export const SearchModulesByRoot: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(within(canvas.getByRole("tabpanel")).getByRole("searchbox"), "bomb");

    const roots = modules(canvas)
      .getAllByRole("button", { name: /^(Ship|Structure) / })
      .map((row) => row.textContent);
    await expect(roots).toEqual(["Ship Equipment", "Structure Equipment", "Structure Modifications"]);

    await userEvent.click(modules(canvas).getByRole("button", { name: "Ship Equipment" }));
    await expect(modules(canvas).queryByRole("button", { name: "Smartbombs" })).toBeNull();
    await expect(modules(canvas).getByRole("button", { name: "Faction & Storyline" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    const smartbombs = modules(canvas)
      .getAllByRole("button", { name: /^(?!Show Info).*Smartbomb/ })
      .map((row) => row.textContent);
    await expect(smartbombs[0]).toBe("'Concussion' Compact Large Graviton Smartbomb");
  },
};

/** A market group without an icon of its own gets a folder. */
export const MarketGroupWithoutIcon: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(within(canvas.getByRole("tabpanel")).getByRole("searchbox"), "launcher");

    const group = modules(canvas).getByRole("button", { name: "Special Edition Assets" });
    await expect(group.querySelector("img")?.getAttribute("src")).toMatch(/\.webp$/);
  },
};

/** No match, no list. */
export const NoModulesFound: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(within(canvas.getByRole("tabpanel")).getByRole("searchbox"), "asdasda");

    await expect(canvas.getByText("No modules found")).toBeVisible();
    await expect(canvas.queryByRole("list", { name: "Modules" })).toBeNull();
  },
};

/** Collapse All closes the groups opened. */
export const CollapseModules: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    const panel = within(canvas.getByRole("tabpanel"));
    await userEvent.click(modules(canvas).getByRole("button", { name: "Hull & Armor" }));
    await expect(modules(canvas).getByRole("button", { name: "Hull & Armor" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await userEvent.click(panel.getByRole("button", { name: "Collapse All Groups" }));
    await expect(modules(canvas).getByRole("button", { name: "Hull & Armor" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};

/** Slot filters keep what goes in any of the slots pressed. */
export const SlotFilters: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    const panel = within(canvas.getByRole("tabpanel"));
    const filterButtons = within(panel.getByRole("group", { name: "Filters" }));
    await userEvent.type(panel.getByRole("searchbox"), "damage control ii");

    await userEvent.click(filterButtons.getByRole("button", { name: "High Slot" }));
    await expect(canvas.getByText("No modules found")).toBeVisible();
    await userEvent.click(filterButtons.getByRole("button", { name: "Low Slot" }));
    await expect(modules(canvas).getByRole("button", { name: "Damage Control II" })).toBeVisible();

    await userEvent.clear(panel.getByRole("searchbox"));
    await userEvent.click(filterButtons.getByRole("button", { name: "Low Slot" }));
    await userEvent.click(filterButtons.getByRole("button", { name: "High Slot" }));
    await userEvent.click(filterButtons.getByRole("button", { name: "Drones" }));
    await expect(modules(canvas).getByRole("button", { name: "Drones" })).toBeVisible();
    await expect(modules(canvas).queryByRole("button", { name: "Hull & Armor" })).toBeNull();
  },
};

/** Hull Restrictions keeps what the Rifter takes: small rigs, and no drones as it has no drone bay. */
export const HullRestrictions: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    const panel = within(canvas.getByRole("tabpanel"));
    await userEvent.click(panel.getByRole("button", { name: "Hull Restrictions" }));

    await userEvent.type(panel.getByRole("searchbox"), "projectile burst aerator i");
    await expect(modules(canvas).getByRole("button", { name: "Small Projectile Burst Aerator I" })).toBeVisible();
    await expect(modules(canvas).queryByRole("button", { name: "Medium Projectile Burst Aerator I" })).toBeNull();

    await userEvent.clear(panel.getByRole("searchbox"));
    await userEvent.type(panel.getByRole("searchbox"), "warrior");
    await expect(canvas.getByText("No modules found")).toBeVisible();
  },
};

const mechanics = 3392;
const hullUpgrades = 3394;

/** Skills keeps the modules the character can use. */
export const ModuleSkills: Story = {
  parameters: { character: { skills: { [mechanics]: 1, [hullUpgrades]: 1 } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    const panel = within(canvas.getByRole("tabpanel"));
    await userEvent.click(panel.getByRole("button", { name: "Skills" }));
    await userEvent.type(panel.getByRole("searchbox"), "damage control i");

    await expect(modules(canvas).getByRole("button", { name: "Damage Control I" })).toBeVisible();
    await expect(modules(canvas).queryByRole("button", { name: "Damage Control II" })).toBeNull();
  },
};

export const AtUiScale150: Story = {
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Item Browser" }).getBoundingClientRect().width).toBe(589.5);
  },
};

const charges = (canvas: ReturnType<typeof within>) => within(canvas.getByRole("list", { name: "Charges" }));

const armed = {
  ship: { type_id: 587 },
  items: [
    { type_id: 10631, slot: { type: "high", index: 1 }, state: "active" },
    { type_id: 2889, slot: { type: "high", index: 0 }, state: "active" },
    { type_id: 2889, slot: { type: "high", index: 2 }, state: "active" },
    { type_id: 2048, slot: { type: "low", index: 0 }, state: "active" },
  ],
};

/** Charges by market group, groups with groups in them first; without modules that load charges, nothing to filter by. */
export const Charges: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    const panel = within(canvas.getByRole("tabpanel"));
    await expect(within(panel.getByRole("group", { name: "Filters" })).queryAllByRole("button")).toEqual([]);

    const groups = charges(canvas)
      .getAllByRole("button", { expanded: false })
      .map((row) => row.textContent);
    await expect(groups.slice(0, 2)).toEqual(["Command Burst Charges", "Condenser Packs"]);
    await expect(groups.slice(-2)).toEqual(["Structure Guided Bombs", "Special Edition Festival Assets"]);
  },
};

/** A fitted module filters the charges to those it loads, flat; one module at a time. */
export const ChargesForModule: Story = {
  parameters: { fit: armed },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    const filters = within(within(canvas.getByRole("tabpanel")).getByRole("group", { name: "Filters" }));
    await expect(filters.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual([
      "200mm AutoCannon II",
      "Rocket Launcher II",
    ]);

    await userEvent.click(filters.getByRole("button", { name: "200mm AutoCannon II" }));
    await expect(filters.getByRole("button", { name: "200mm AutoCannon II" })).toHaveAttribute("aria-pressed", "true");
    await expect(charges(canvas).queryByRole("button", { name: "Projectile Ammo" })).toBeNull();
    const rows = charges(canvas)
      .getAllByRole("button", { name: /^(?!Show Info).* S$/ })
      .map((row) => row.textContent);
    await expect(rows.slice(0, 2)).toEqual(["Carbonized Lead S", "Depleted Uranium S"]);
    await expect(rows).toContain("Barrage S");
    await expect(rows).not.toContain("EMP M");
    await expect(charges(canvas).getByRole("button", { name: "Faction & Storyline" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await userEvent.click(filters.getByRole("button", { name: "Rocket Launcher II" }));
    await expect(filters.getByRole("button", { name: "200mm AutoCannon II" })).toHaveAttribute("aria-pressed", "false");
    await expect(charges(canvas).getByRole("button", { name: "Mjolnir Rocket" })).toBeVisible();
    await expect(charges(canvas).queryByRole("button", { name: "EMP S" })).toBeNull();

    await userEvent.click(filters.getByRole("button", { name: "Rocket Launcher II" }));
    await expect(charges(canvas).getByRole("button", { name: "Missiles" })).toBeVisible();
  },
};

export const SearchCharges: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    const search = within(canvas.getByRole("tabpanel")).getByRole("searchbox");
    await userEvent.type(search, "emp s");

    await expect(charges(canvas).getByRole("button", { name: "EMP S" })).toBeVisible();
    await expect(charges(canvas).queryByRole("button", { name: "Ammunition & Charges" })).toBeNull();
    await expect(charges(canvas).queryByRole("button", { name: "Projectile Ammo" })).toBeNull();

    await userEvent.type(search, "dasda");
    await expect(canvas.getByText("No charges found")).toBeVisible();
  },
};
