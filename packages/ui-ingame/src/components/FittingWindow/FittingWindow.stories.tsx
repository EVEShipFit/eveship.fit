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

const meta = {
  component: FittingWindow,
} satisfies Meta<typeof FittingWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas }) => {
    const window = canvas.getByRole("region", { name: "Fitting Window" });
    const { width, height } = window.getBoundingClientRect();
    await expect(width).toBe(700);
    await expect(height).toBe(630);

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
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(1100));
    const left = fitting.getBoundingClientRect().left;

    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(canvas.queryByRole("region", { name: "Item Browser" })).toBeNull());
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(700));
    await expect(fitting.getBoundingClientRect().left).toBe(left - 400);

    await userEvent.click(button);
    await waitFor(() => expect(canvas.getByRole("region", { name: "Item Browser" })).toBeVisible());
  },
};

export const SimulateShip: Story = {
  args: { browser: <ItemBrowser /> },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "slasher");
    await userEvent.click(canvas.getByRole("button", { name: "Simulate Slasher" }));

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
    await userEvent.dblClick(canvas.getByRole("button", { name: "Saved Rifter" }));

    const history = within(canvas.getByRole("group", { name: "Simulation History" }));
    await expect(history.getByRole("button", { current: true })).toHaveAccessibleName("2 of 2");
    await expect(canvas.getAllByText("Saved Rifter")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: /^Rocket Launcher II/ })).toBeInTheDocument();
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
    await waitFor(() => expect(window.getBoundingClientRect().width).toBe(700));

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
    await expect(canvas.getByRole("group", { name: "Cargo Hold" })).toHaveTextContent("0.3/140.0m3");
    await expect(canvas.getByRole("group", { name: "Drone Bay" })).toHaveTextContent("0.0/0.0m3");
  },
};

export const Broken: Story = {
  parameters: { fit: broken, character: { skills: {} } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: /^Missing Skills: \d+$/ })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Errors: 1" })).toBeInTheDocument();
    await expect(canvas.getByRole("img", { name: "Fitting Warnings: 4" })).toBeInTheDocument();
    await expect(canvas.getByRole("group", { name: "Cargo Hold" })).toHaveAttribute("data-over");
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
    await expect(canvas.getByRole("region", { name: "Fitting Window" }).getBoundingClientRect().width).toBe(1050);
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(858);
  },
};

/** Storybook's `userEvent` cannot drag, so the events are fired as a browser would. */
async function dragAndDrop(from: Element, to: Element) {
  const dataTransfer = new DataTransfer();
  await fireEvent.dragStart(from, { dataTransfer });
  await waitFor(async () => expect(await fireEvent.dragOver(to, { dataTransfer })).toBe(false));
  await fireEvent.drop(to, { dataTransfer });
  await fireEvent.dragEnd(from, { dataTransfer });
}
