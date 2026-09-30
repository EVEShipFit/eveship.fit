import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, fireEvent, spyOn, waitFor, within } from "storybook/test";

import { ItemBrowser } from "../ItemBrowser/ItemBrowser";
import { ShipStatistics } from "../ShipStatistics/ShipStatistics";
import { FittingWindow } from "./FittingWindow";

const types = {
  Rifter: 587,
  "200mm AutoCannon II": 2889,
  "EMP S": 185,
  "Rocket Launcher II": 10631,
  "1MN Afterburner II": 438,
  "Small Shield Extender II": 380,
  "Damage Control II": 2048,
  "Gyrostabilizer II": 519,
  "Small Projectile Burst Aerator I": 31668,
  "Medium Projectile Burst Aerator I": 31670,
  "Nanite Repair Paste": 28668,
  "Hobgoblin II": 2456,
  Tristan: 593,
  "Hammerhead II": 2185,
  "Warrior II": 2488,
  Keepstar: 35834,
  "Standup Market Hub I": 35892,
  "Standup Cloning Center I": 35894,
  "Standup Anticapital Missile Launcher I": 35921,
  "Standup XL Cruise Missile": 37844,
  "Standup Templar I": 47035,
  Nyx: 23913,
  "Templar II": 40556,
  "Antaeus II": 40562,
  "Cyclops II": 40563,
  "Gungnir II": 40564,
};

const rifter = {
  name: "Storybook Rifter",
  ship: { type_id: types.Rifter },
  items: [
    {
      type_id: types["200mm AutoCannon II"],
      slot: { type: "high", index: 0 },
      state: "active",
      charge: { type_id: types["EMP S"] },
    },
    { type_id: types["200mm AutoCannon II"], slot: { type: "high", index: 1 }, state: "overload" },
    { type_id: types["Rocket Launcher II"], slot: { type: "high", index: 2 }, state: "active" },
    { type_id: types["1MN Afterburner II"], slot: { type: "medium", index: 0 }, state: "active" },
    { type_id: types["Small Shield Extender II"], slot: { type: "medium", index: 1 }, state: "active" },
    { type_id: types["Damage Control II"], slot: { type: "low", index: 0 }, state: "active" },
    { type_id: types["Gyrostabilizer II"], slot: { type: "low", index: 1 }, state: "offline" },
    { type_id: types["Small Projectile Burst Aerator I"], slot: { type: "rig", index: 0 }, state: "active" },
    { type_id: types["Nanite Repair Paste"], slot: { type: "cargo" }, quantity: 30, state: "offline" },
  ],
};

/** One error: the rig size. Four warnings: cargo hold, drone bay, drone bandwidth and launched drones. */
const broken = {
  ...rifter,
  items: [
    ...rifter.items.filter((item) => item.slot.type !== "cargo"),
    { type_id: types["Medium Projectile Burst Aerator I"], slot: { type: "rig", index: 1 }, state: "active" },
    { type_id: types["Nanite Repair Paste"], slot: { type: "cargo" }, quantity: 20000, state: "offline" },
    { type_id: types["Hobgoblin II"], slot: { type: "drone_bay" }, quantity: 1, state: "active" },
  ],
};

const keepstar = {
  name: "Storybook Keepstar",
  ship: { type_id: types.Keepstar },
  items: [
    {
      type_id: types["Standup Anticapital Missile Launcher I"],
      slot: { type: "high", index: 0 },
      state: "active",
      charge: { type_id: types["Standup XL Cruise Missile"] },
    },
    { type_id: types["Standup Market Hub I"], slot: { type: "service", index: 0 }, state: "online" },
    { type_id: types["Standup Cloning Center I"], slot: { type: "service", index: 1 }, state: "offline" },
    { type_id: types["Standup XL Cruise Missile"], slot: { type: "cargo" }, quantity: 16, state: "offline" },
    { type_id: types["Standup Templar I"], slot: { type: "fighter_bay" }, quantity: 9, state: "offline" },
  ],
};

const nyx = {
  name: "Storybook Nyx",
  ship: { type_id: types.Nyx },
  items: [
    { type_id: types["Antaeus II"], slot: { type: "fighter_tube", index: 0 }, quantity: 6, state: "active" },
    { type_id: types["Cyclops II"], slot: { type: "fighter_tube", index: 2 }, quantity: 3, state: "active" },
    { type_id: types["Gungnir II"], slot: { type: "fighter_bay" }, quantity: 6, state: "offline" },
    { type_id: types["Templar II"], slot: { type: "fighter_bay" }, quantity: 12, state: "offline" },
  ],
};

const meta = {
  component: FittingWindow,
} satisfies Meta<typeof FittingWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    const { width, height } = window.getBoundingClientRect();
    await expect(width).toBe(708);
    await expect(height).toBe(694);

    await expect(canvas.getByRole("region", { name: "Fitting" })).toBeInTheDocument();
    await expect(canvas.getByText("Rifter")).toBeInTheDocument();
    await expect(canvas.queryByRole("img", { name: /^Fitting|^Missing/ })).toBeNull();
    await expect(canvas.getAllByRole("button", { name: /of 1$/ })).toHaveLength(1);
    await expect(canvas.queryByRole("button", { name: "Statistics" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Item Browser" })).toBeNull();
  },
};

export const WithItemBrowser: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, userEvent }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    const fitting = canvas.getByRole("region", { name: "Fitting" });
    const button = canvas.getByRole("button", { name: "Item Browser" });
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", { name: "Item Browser" })).toBeVisible();
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(1108));
    const left = fitting.getBoundingClientRect().left;

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(canvas.queryByRole("region", { name: "Item Browser" })).toBeNull());
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(708));
    await expect(fitting.getBoundingClientRect().left).toBe(left - 400);

    await userEvent.click(button);
    await waitFor(() => expect(canvas.getByRole("region", { name: "Item Browser" })).toBeVisible());
  },
};

export const SimulateShip: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "slasher");
    await userEvent.click(canvas.getByRole("button", { name: "Frigate" }));
    await userEvent.click(canvas.getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Simulate Slasher" }));

    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");
    await expect(canvas.getAllByText("Slasher")).toHaveLength(2);
  },
};

/** Dragging a hull to the middle of the wheel simulates it; a slot refuses it. */
export const DragHull: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "slasher");
    await userEvent.click(canvas.getByRole("button", { name: "Frigate" }));
    await userEvent.click(canvas.getByRole("button", { name: /^Minmatar/ }));
    const slasher = canvas.getByRole("button", { name: "Slasher" });
    await expect(slasher).toHaveAttribute("draggable", "true");

    const wheel = canvas.getByRole("region", { name: "Fitting" });
    await refuses(slasher, wheel.querySelector("[data-state]")!);
    await dragAndDrop(slasher, canvasElement.querySelector("[data-centre]")!);

    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");
    await expect(canvas.getAllByText("Slasher")).toHaveLength(2);
  },
};

export const LoadFit: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { localFits: [{ ...rifter, name: "Saved Rifter" }] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "saved");
    await userEvent.click(canvas.getByRole("button", { name: "Frigate" }));
    await userEvent.click(canvas.getByRole("button", { name: /^Minmatar/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Rifter" }));
    await userEvent.dblClick(canvas.getByRole("button", { name: "Saved Rifter" }));

    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");
    await expect(canvas.getAllByText("Saved Rifter")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: /^Rocket Launcher II/ })).toBeInTheDocument();
  },
};

/** A preview colours what it leaves of CPU and power grid: green for more, red for less. */
export const PreviewResources: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, userEvent }) => {
    const cpu = canvas.getByText("CPU").parentElement!;
    const powerGrid = canvas.getByText("Power Grid").parentElement!;
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "co-processor ii");
    const row = canvas.getByRole("button", { name: "Co-Processor II" });

    await userEvent.hover(row);
    await waitFor(() => expect(cpu).toHaveAttribute("data-change", "better"));
    await expect(powerGrid).toHaveAttribute("data-change", "worse");

    await userEvent.unhover(row);
    await waitFor(() => expect(cpu).not.toHaveAttribute("data-change"));
    await expect(powerGrid).not.toHaveAttribute("data-change");
  },
};

export const ResourceTooltips: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByText("CPU"));
    await expect(canvas.getByText("CPU Output")).toBeVisible();

    await userEvent.hover(canvas.getByText("Power Grid"));
    await expect(canvas.getByText("Powergrid Output")).toBeVisible();
  },
};

/** Hovering a module shows it in the wheel; a double click fits it. */
export const FitModule: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "damage control ii");
    const row = canvas.getByRole("button", { name: "Damage Control II" });

    await userEvent.hover(row);
    await waitFor(() => expect(wheel.querySelectorAll("[data-preview]")).toHaveLength(1));
    await expect(within(wheel).queryByRole("button", { name: /^Damage Control II/ })).toBeNull();

    await userEvent.unhover(row);
    await waitFor(() => expect(wheel.querySelectorAll("[data-preview]")).toHaveLength(0));

    await userEvent.dblClick(row);
    await expect(within(wheel).getByRole("button", { name: /^Damage Control II,/ })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("[data-preview]")).toHaveLength(0);
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");
  },
};

/** Dragging a module to a slot fits it there; to the middle of the wheel, in the first free slot. */
export const DragModule: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    const lowSlots = () => Array.from(wheel.querySelectorAll("[data-state]")).slice(16, 20);
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "damage control ii");

    await dragAndDrop(canvas.getByRole("button", { name: "Damage Control II" }), lowSlots()[2]!);
    await expect(lowSlots()[2]!.querySelector("[role=button]")).toHaveAccessibleName(/^Damage Control II,/);

    await dragAndDrop(
      canvas.getByRole("button", { name: "Damage Control II" }),
      canvasElement.querySelector("[data-centre]")!,
    );
    await expect(lowSlots()[0]!.querySelector("[role=button]")).toHaveAccessibleName(/^Damage Control II,/);
  },
};

/** A module drags its own icon, and previews where it goes over the middle of the wheel. */
export const DragModulePreview: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    const previews = () => wheel.querySelectorAll("[data-preview]");
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "damage control ii");
    const row = canvas.getByRole("button", { name: "Damage Control II" });
    await userEvent.hover(row);
    await waitFor(() => expect(previews()).toHaveLength(1));

    const dataTransfer = new DataTransfer();
    const setDragImage = spyOn(dataTransfer, "setDragImage");
    await fireEvent.dragStart(row, { dataTransfer });
    await expect(setDragImage).toHaveBeenCalledWith(expect.any(HTMLElement), 32, 32);
    const image = setDragImage.mock.calls[0]![0] as HTMLElement;
    await expect(Array.from(image.querySelectorAll("img"), (layer) => layer.loading)).toEqual(["eager", "eager"]);
    await waitFor(() => expect(previews()).toHaveLength(0));

    const centre = canvasElement.querySelector("[data-centre]")!;
    await waitFor(async () => {
      await fireEvent.dragEnter(centre, { dataTransfer });
      await expect(previews()).toHaveLength(1);
    });
    await fireEvent.dragLeave(centre, { dataTransfer });
    await waitFor(() => expect(previews()).toHaveLength(0));
    await fireEvent.dragEnd(row, { dataTransfer });
  },
};

/** Anything dropped on the cargo hold goes in it, and drones on the drone bay; a charge nothing loads goes nowhere else. */
export const DropOnBays: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { fit: { ship: { type_id: types.Tristan }, items: [] } },
  play: async ({ canvas, userEvent }) => {
    const hold = canvas.getByRole("button", { name: "Cargo Hold" });
    const droneBay = canvas.getByRole("button", { name: "Drone Bay" });
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    const step = () => history.getByRole("button", { current: true });
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    const search = canvas.getByRole("searchbox", { name: "Search" });

    await userEvent.type(search, "hobgoblin ii");
    const hobgoblin = canvas.getByRole("button", { name: "Hobgoblin II" });
    const dragged = new DataTransfer();
    await fireEvent.dragStart(hobgoblin, { dataTransfer: dragged });
    await waitFor(async () => {
      await fireEvent.dragEnter(droneBay, { dataTransfer: dragged });
      await expect(droneBay).toHaveTextContent("5.0/40.0m3");
    });
    await fireEvent.dragLeave(droneBay, { dataTransfer: dragged });
    await expect(droneBay).toHaveTextContent("0.0/40.0m3");
    await fireEvent.dragEnd(hobgoblin, { dataTransfer: dragged });

    await dragAndDrop(canvas.getByRole("button", { name: "Hobgoblin II" }), droneBay);
    await expect(droneBay).toHaveTextContent("5.0/40.0m3");
    await dragAndDrop(canvas.getByRole("button", { name: "Hobgoblin II" }), hold);
    await expect(step()).toHaveAccessibleName("3 of 3");

    await userEvent.clear(search);
    await userEvent.type(search, "damage control ii");
    const damageControl = canvas.getByRole("button", { name: "Damage Control II" });
    await refuses(damageControl, droneBay);
    await dragAndDrop(damageControl, hold);

    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    const chargeSearch = canvas.getByRole("searchbox", { name: "Search" });
    await userEvent.type(chargeSearch, "emp s");
    await userEvent.dblClick(canvas.getByRole("button", { name: "EMP S" }));
    await expect(step()).toHaveAccessibleName("4 of 4");
    await dragAndDrop(canvas.getByRole("button", { name: "EMP S" }), hold);
    await expect(step()).toHaveAccessibleName("5 of 5");

    await userEvent.click(hold);
    const list = await canvas.findByRole("list", { name: "Cargo Hold" });
    await expect(
      within(list)
        .getAllByRole("spinbutton")
        .map((count) => count.getAttribute("aria-label")),
    ).toEqual(["Number of Damage Control II", "Number of EMP S", "Number of Hobgoblin II"]);
  },
};

/** A bay or the middle of the wheel refuses what it would not take. */
export const DropRefused: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "hobgoblin ii");
    await refuses(
      canvas.getByRole("button", { name: "Hobgoblin II" }),
      canvas.getByRole("button", { name: "Drone Bay" }),
    );

    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "scourge heavy missile");
    await refuses(
      canvas.getByRole("button", { name: "Scourge Heavy Missile" }),
      canvasElement.querySelector("[data-centre]")!,
    );

    const damageControl = within(canvas.getByRole("region", { name: "Fitting" })).getByRole("button", {
      name: /^Damage Control II/,
    });
    await refuses(damageControl, canvas.getByRole("button", { name: "Cargo Hold" }));
  },
};

/** A double click loads a charge in every module that takes it; a drop, in that one module. */
export const LoadCharge: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    const loaded = () => wheel.querySelectorAll("[data-state]:has([data-loaded])");
    const slots = (name: RegExp) =>
      within(wheel)
        .getAllByRole("button", { name })
        .map((module) => module.closest("[data-state]")!);
    const icons = (name: RegExp) => slots(name).map((slot) => slot.querySelector("img")!.src);
    await userEvent.click(canvas.getByRole("tab", { name: "Charges" }));
    await userEvent.click(canvas.getByRole("button", { name: "Rocket Launcher II" }));
    await expect(loaded()).toHaveLength(1);

    await dragAndDrop(canvas.getByRole("button", { name: "Mjolnir Rocket" }), slots(/^Rocket Launcher II/)[0]!);
    await expect(loaded()).toHaveLength(2);

    await userEvent.click(canvas.getByRole("button", { name: "200mm AutoCannon II" }));
    const fusion = canvas.getByRole("button", { name: "Fusion S" });
    const dataTransfer = new DataTransfer();
    await fireEvent.dragStart(fusion, { dataTransfer });
    await expect(await fireEvent.dragOver(slots(/^Rocket Launcher II/)[0]!, { dataTransfer })).toBe(true);
    await fireEvent.dragEnd(fusion, { dataTransfer });

    const unloaded = slots(/^200mm AutoCannon II/).find((slot) => !slot.querySelector("[data-loaded]"))!;
    await dragAndDrop(fusion, unloaded);
    await expect(loaded()).toHaveLength(3);
    const [first, second] = icons(/^200mm AutoCannon II/);
    await expect(first).not.toBe(second);

    await userEvent.dblClick(fusion);
    await waitFor(() => expect(new Set(icons(/^200mm AutoCannon II/)).size).toBe(1));
  },
};

export const WithBoth: Story = {
  args: { browser: <ItemBrowser />, statistics: <ShipStatistics /> },
  play: async ({ canvas }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(1372));
    await expect(canvas.getByRole("region", { name: "Item Browser" })).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Statistics" })).toBeVisible();
  },
};

export const WithStatistics: Story = {
  args: { statistics: <ShipStatistics /> },
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    const button = canvas.getByRole("button", { name: "Statistics" });
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", { name: "Statistics" })).toBeVisible();
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(972));

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(canvas.queryByRole("region", { name: "Statistics" })).toBeNull());
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(708));

    await userEvent.click(button);
    await waitFor(() => expect(canvas.getByRole("region", { name: "Statistics" })).toBeVisible());
  },
};

export const FittedRifter: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Storybook Rifter")).toBeInTheDocument();
    await expect(canvas.getByText("CPU").parentElement).toHaveTextContent(/^CPU\d+\.\d\/\d+\.\d$/);
    await expect(canvas.getByText("Power Grid").parentElement).toHaveTextContent(/^Power Grid\d+\.\d\/\d+\.\d$/);
    await expect(canvas.getByRole("button", { name: "Cargo Hold" })).toHaveTextContent("0.3/140.0m3");
    await expect(canvas.getByRole("button", { name: "Drone Bay" })).toHaveTextContent("0.0/0.0m3");
  },
};

/** Clicking the cargo hold lists what is in it, if anything; each count, removal and Remove All is one step. */
export const CargoHold: Story = {
  parameters: {
    fit: {
      ...rifter,
      items: [
        ...rifter.items,
        { type_id: types["EMP S"], slot: { type: "cargo" }, quantity: 200, state: "offline" },
        { type_id: types["Hobgoblin II"], slot: { type: "cargo" }, quantity: 2, state: "offline" },
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const hold = canvas.getByRole("button", { name: "Cargo Hold" });
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await userEvent.click(hold);
    const list = await canvas.findByRole("list", { name: "Cargo Hold" });
    await expect(list).toBeVisible();
    await expect(
      within(list)
        .getAllByRole("spinbutton")
        .map((count) => [count.getAttribute("aria-label"), (count as HTMLInputElement).valueAsNumber]),
    ).toEqual([
      ["Number of EMP S", 200],
      ["Number of Hobgoblin II", 2],
      ["Number of Nanite Repair Paste", 30],
    ]);

    await userEvent.click(canvas.getByRole("button", { name: "Remove Hobgoblin II" }));
    await expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "Remove Nanite Repair Paste" })).toHaveFocus();
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");

    const emp = canvas.getByRole("spinbutton", { name: "Number of EMP S" });
    await userEvent.tripleClick(emp);
    await userEvent.keyboard("50{Enter}");
    await userEvent.keyboard("{ArrowUp}");
    await expect(emp).toHaveValue(51);
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("4 of 4");

    await userEvent.tripleClick(emp);
    await userEvent.keyboard("0{Enter}");
    await userEvent.tripleClick(emp);
    await userEvent.keyboard("70{Escape}");
    await expect(emp).toHaveValue(51);
    await userEvent.tripleClick(emp);
    await userEvent.keyboard("60");
    await userEvent.tab();
    await expect(emp).toHaveValue(60);
    await userEvent.click(emp);
    await userEvent.click(canvas.getByRole("button", { name: "One fewer EMP S" }));
    await expect(emp).toHaveValue(59);
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("6 of 6");

    await userEvent.click(canvas.getByRole("button", { name: "Remove All" }));
    await expect(canvas.queryByRole("list", { name: "Cargo Hold" })).toBeNull();
    await expect(hold).toHaveFocus();
    await expect(hold).toHaveTextContent("0.0/140.0m3");
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("7 of 7");

    await userEvent.click(hold);
    await expect(await canvas.findByText("No Cargo Items Simulated")).toBeVisible();
  },
};

/** Clicking the drone bay lists its drones, with boxes for how many are active; each change is one step. */
export const DroneBay: Story = {
  parameters: {
    fit: {
      ship: { type_id: types.Tristan },
      items: [
        { type_id: types["Warrior II"], slot: { type: "drone_bay" }, quantity: 2, state: "active" },
        { type_id: types["Hobgoblin II"], slot: { type: "drone_bay" }, quantity: 1, state: "active" },
        { type_id: types["Hobgoblin II"], slot: { type: "drone_bay" }, quantity: 2, state: "offline" },
        { type_id: types["Hammerhead II"], slot: { type: "drone_bay" }, quantity: 3, state: "offline" },
      ],
    },
  },
  play: async ({ canvas, userEvent }) => {
    const bay = canvas.getByRole("button", { name: "Drone Bay" });
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    const step = () => history.getByRole("button", { current: true });
    const header = () => canvas.getByText(/^Active drones:/);
    await userEvent.click(bay);
    const list = await canvas.findByRole("list", { name: "Drone Bay" });
    await expect(list).toBeVisible();
    await expect(header()).toHaveTextContent("Active drones: 3 / 5");
    await expect(canvas.getByRole("spinbutton", { name: "Number of Hobgoblin II" })).toHaveValue(3);
    await expect(canvas.getByRole("spinbutton", { name: "Number of Warrior II" })).toHaveValue(2);

    const hobgoblins = within(canvas.getByRole("group", { name: "Active Hobgoblin II" }));
    const boxes = () => hobgoblins.getAllByRole("button").map((box) => box.dataset.state);
    await expect(boxes()).toEqual(["active", "open", "open", "none", "none"]);
    await expect(hobgoblins.getByRole("button", { pressed: true })).toHaveAccessibleName("1 active");
    const hammerheads = within(canvas.getByRole("group", { name: "Active Hammerhead II" }));
    await expect(hammerheads.getAllByRole("button").map((box) => box.dataset.state)).toEqual([
      "open",
      "over",
      "over",
      "none",
      "none",
    ]);
    await expect(hammerheads.getByRole("button", { name: "1 active" })).toBeEnabled();
    await expect(hammerheads.getByRole("button", { name: "2 active" })).toBeDisabled();

    await userEvent.click(hobgoblins.getByRole("button", { name: "3 active" }));
    await expect(boxes()).toEqual(["active", "active", "active", "none", "none"]);
    await expect(hobgoblins.getByRole("button", { pressed: true })).toHaveAccessibleName("3 active");
    await expect(header()).toHaveTextContent("Active drones: 5 / 5");
    await expect(step()).toHaveAccessibleName("2 of 2");

    await userEvent.click(hobgoblins.getByRole("button", { name: "3 active" }));
    await expect(boxes()).toEqual(["active", "active", "open", "none", "none"]);
    await expect(step()).toHaveAccessibleName("3 of 3");

    await userEvent.click(canvas.getByRole("button", { name: "Remove Warrior II" }));
    await expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "Remove Hobgoblin II" })).toHaveFocus();
    await expect(header()).toHaveTextContent("Active drones: 2 / 5");
    await expect(step()).toHaveAccessibleName("4 of 4");

    const count = canvas.getByRole("spinbutton", { name: "Number of Hobgoblin II" });
    await userEvent.tripleClick(count);
    await userEvent.keyboard("6{Enter}");
    await expect(count).toHaveValue(6);
    await expect(header()).toHaveTextContent("Active drones: 5 / 5");
    await userEvent.keyboard("{ArrowDown}");
    await expect(count).toHaveValue(5);
    await expect(step()).toHaveAccessibleName("6 of 6");

    await userEvent.click(canvas.getByRole("button", { name: "Remove All" }));
    await userEvent.click(bay);
    await expect(await canvas.findByText("No Drones Simulated")).toBeVisible();
  },
};

/** Service modules go in a row below the wheel; the ammo hold has no limit, and fighters go in the fighter bay. */
export const Keepstar: Story = {
  args: { statistics: <ShipStatistics /> },
  parameters: { fit: keepstar },
  play: async ({ canvas, userEvent }) => {
    const services = canvas.getAllByRole("button", { name: /^Standup (Market Hub|Cloning Center) I/ });
    await expect(services.map((service) => service.getAttribute("aria-label"))).toEqual([
      "Standup Market Hub I, online",
      "Standup Cloning Center I, offline",
    ]);
    await expect(canvas.getByRole("group", { name: "Structure Services" }).children).toHaveLength(8);
    await expect(canvas.getByRole("button", { name: "Ammo Hold" })).toHaveTextContent("8.0/0.0m3");
    await expect(canvas.getByRole("button", { name: "Ammo Hold" })).not.toHaveAttribute("data-over");
    await expect(canvas.getByRole("button", { name: "Fighter Bay" })).toHaveTextContent("18,000.0/400,000.0m3");
    await expect(canvas.queryByRole("button", { name: "Cargo Hold" })).toBeNull();
    await expect(canvas.queryByRole("img", { name: /^Fitting/ })).toBeNull();
    const history = canvas.getByRole("group", { name: "Simulation History" }).getBoundingClientRect();
    const rack = canvas.getByRole("group", { name: "Structure Services" }).getBoundingClientRect();
    await expect(history.top).toBeGreaterThanOrEqual(rack.bottom);
    const wheel = canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect();
    await expect(rack.left + rack.width / 2).toBeCloseTo(wheel.left + wheel.width / 2, 0);
    await expect(canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect().height).toBe(694);

    await userEvent.click(services[1]!);
    await expect(canvas.getByRole("button", { name: "Standup Cloning Center I, online" })).toBeInTheDocument();
    const actions = within(canvas.getByRole("group", { name: "Standup Market Hub I" }));
    services[0]!.focus();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(actions.getByRole("button", { name: "Put Offline" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    canvas.getByRole("button", { name: "Standup Market Hub I, offline" }).focus();
    await userEvent.tab();
    await expect(actions.getByRole("button", { name: "Unfit Module" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("button", { name: /^Standup Market Hub I/ })).toBeNull();

    const steps = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(steps.getByRole("button", { current: true })).toHaveAccessibleName("4 of 4");
  },
};

/** Dragging a service module to a service slot fits it there, and moves a fitted one. */
export const DragServiceModule: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { fit: { ship: { type_id: types.Keepstar }, items: [] } },
  play: async ({ canvas, userEvent }) => {
    const slots = () => canvas.getByRole("group", { name: "Structure Services" }).children;
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "standup market hub i");

    await dragAndDrop(await canvas.findByRole("button", { name: "Standup Market Hub I" }), slots()[3]!);
    await expect(slots()[3]!).toHaveAttribute("data-state", "online");

    await dragAndDrop(canvas.getByRole("button", { name: "Standup Market Hub I, online" }), slots()[5]!);
    await expect(slots()[3]!).toHaveAttribute("data-state", "empty");
    await expect(slots()[5]!).toHaveAttribute("data-state", "online");
  },
};

/** The squadrons in the fighter tubes, full or not. */
export const FighterSquadrons: Story = {
  args: { statistics: <ShipStatistics /> },
  parameters: {
    fit: {
      ship: { type_id: types.Keepstar },
      items: [
        { type_id: types["Standup Templar I"], slot: { type: "fighter_tube", index: 0 }, quantity: 9, state: "online" },
        { type_id: types["Standup Templar I"], slot: { type: "fighter_tube", index: 1 }, quantity: 4, state: "online" },
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fighters" })).toHaveTextContent(
      "1 Full Squadrons1 Partial Squadrons",
    );
  },
};

/** A carrier has a fighter bay for a drone bay: its tubes above what is in it; each change is one step. */
export const FighterBay: Story = {
  args: { statistics: <ShipStatistics /> },
  parameters: { fit: nyx },
  play: async ({ canvas, userEvent }) => {
    const bay = canvas.getByRole("button", { name: "Fighter Bay" });
    const step = () =>
      within(canvas.getByRole("group", { name: "Simulation History" })).getByRole("button", { current: true });
    await expect(canvas.queryByRole("button", { name: "Drone Bay" })).toBeNull();
    await expect(bay).toHaveTextContent("24,000.0/137,500.0m3");
    await expect(canvas.getByRole("region", { name: "Fighters" })).toHaveTextContent(
      "1 Full Squadrons1 Partial Squadrons",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Manage" }));
    const tubes = await canvas.findByRole("group", { name: "Fighter Tubes" });
    await expect(tubes).toBeVisible();
    await expect(canvas.getByLabelText("Light Fighters: 0 of 3")).toBeInTheDocument();
    await expect(canvas.getByLabelText("Heavy Fighters: 2 of 4")).toBeInTheDocument();
    await expect(canvas.queryByLabelText(/^Support Fighters/)).toBeNull();
    await expect([...tubes.children].map((tube) => tube.getAttribute("data-state"))).toEqual([
      "launched",
      "open",
      "launched",
      "open",
      "open",
    ]);
    await expect(
      within(canvas.getByRole("list", { name: "Fighter Bay" }))
        .getAllByRole("spinbutton")
        .map((count) => [count.getAttribute("aria-label"), (count as HTMLInputElement).valueAsNumber]),
    ).toEqual([
      ["Number of Gungnir II", 6],
      ["Number of Templar II", 12],
    ]);

    await userEvent.click(canvas.getByRole("button", { name: "One more Cyclops II" }));
    await expect(within(tubes).getAllByRole("meter")[1]).toHaveAttribute("aria-valuetext", "4 of 6");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Antaeus II" }));
    await expect(tubes.children[0]).toHaveAttribute("data-state", "open");
    await expect(canvas.getByLabelText("Heavy Fighters: 1 of 4")).toBeInTheDocument();
    await expect(step()).toHaveAccessibleName("3 of 3");

    await userEvent.click(canvas.getByRole("button", { name: "Remove All" }));
    await expect(step()).toHaveAccessibleName("4 of 4");
    await userEvent.click(bay);
    await expect(await canvas.findByText("No Fighters Simulated in Fighter Bay")).toBeVisible();
    await expect([...tubes.children].map((tube) => tube.getAttribute("data-state"))).toEqual([
      "open",
      "open",
      "open",
      "open",
      "open",
    ]);
    await expect(canvas.queryByRole("button", { name: "Remove All" })).toBeNull();
  },
};

/** Hovering a fighter shows it in the tube it would launch from; dropping it on a tube launches it there. */
export const LaunchFighters: Story = {
  args: { browser: <ItemBrowser /> },
  parameters: { fit: { ship: { type_id: types.Nyx }, items: [] } },
  play: async ({ canvas, userEvent }) => {
    const bay = canvas.getByRole("button", { name: "Fighter Bay" });
    await userEvent.click(canvas.getByRole("tab", { name: "Modules" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "cyclops ii");
    const cyclops = await canvas.findByRole("button", { name: "Cyclops II" });

    await userEvent.click(bay);
    const tubes = await canvas.findByRole("group", { name: "Fighter Tubes" });
    await userEvent.hover(cyclops);
    await expect(tubes.children[0]).toHaveAttribute("data-preview");
    await userEvent.unhover(cyclops);
    await expect(tubes.children[0]).toHaveAttribute("data-state", "open");

    await dragAndDrop(cyclops, tubes.children[3]!);
    await expect(tubes.children[3]).toHaveAttribute("data-state", "launched");
    await dragAndDrop(canvas.getByRole("button", { name: "Cyclops II" }), bay);
    await userEvent.dblClick(canvas.getByRole("button", { name: "Cyclops II" }));
    await expect(tubes.children[0]).toHaveAttribute("data-state", "launched");
    if (!tubes.closest("[popover]")!.matches(":popover-open")) await userEvent.click(bay);
    await expect(await canvas.findByRole("spinbutton", { name: "Number of Cyclops II" })).toHaveValue(6);
  },
};

export const Broken: Story = {
  parameters: { fit: broken, character: { skills: {} } },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("img", { name: /^Missing Skills: \d+$/ })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Errors: 1" })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Warnings: 4" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Cargo Hold" })).toHaveAttribute("data-over");

    const errors = canvas.getByRole("img", { name: "Fitting Errors: 1" });
    await expect(errors).toHaveAccessibleDescription(
      "Medium Projectile Burst Aerator I: rig size does not match the ship",
    );
    await userEvent.hover(errors);
    await expect(canvas.getByText("Fitting Alert")).toBeVisible();

    const warnings = canvas.getByRole("img", { name: "Fitting Warnings: 4" });
    await expect(warnings).toHaveAccessibleDescription(/Cargo hold overloaded/);
    await expect(warnings).toHaveAccessibleDescription(/Too many drones launched/);
    await userEvent.hover(warnings);
    await expect(canvas.getByText("Fitting Warning")).toBeVisible();

    const skills = canvas.getByRole("img", { name: /^Missing Skills: \d+$/ });
    await expect(skills).toHaveAccessibleDescription(/Gunnery II/);
    await userEvent.hover(skills);
    await expect(canvas.getByText("Missing Skills")).toBeVisible();
  },
};

export const History: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });

    await userEvent.click(afterburner());
    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("3 of 3");

    await userEvent.click(history.getByRole("button", { name: "1 of 3" }));
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, active");

    await userEvent.click(canvas.getByRole("button", { name: /^Damage Control II/ }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("4 of 4");
    await userEvent.click(history.getByRole("button", { name: "3 of 4" }));
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");
  },
};

export const AtUiScale150: Story = {
  parameters: { fit: rifter },
  decorators: [(Story) => <div style={{ "--esf-scale": 1.5 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect().width).toBe(1062);
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(858);
  },
};

/** A drop target refuses by not cancelling `dragover`. */
async function refuses(from: Element, to: Element) {
  const dataTransfer = new DataTransfer();
  await fireEvent.dragStart(from, { dataTransfer });
  await expect(await fireEvent.dragOver(to, { dataTransfer })).toBe(true);
  await fireEvent.dragEnd(from, { dataTransfer });
}

/** Storybook's `userEvent` cannot drag, so the events are fired as a browser would. */
async function dragAndDrop(from: Element, to: Element) {
  const dataTransfer = new DataTransfer();
  await fireEvent.dragStart(from, { dataTransfer });
  await waitFor(async () => expect(await fireEvent.dragOver(to, { dataTransfer })).toBe(false));
  await fireEvent.drop(to, { dataTransfer });
  await fireEvent.dragEnd(from, { dataTransfer });
}
