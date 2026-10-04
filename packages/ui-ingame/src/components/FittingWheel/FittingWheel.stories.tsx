import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, waitFor, within } from "storybook/test";

import { FittingWheel } from "./FittingWheel";

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
};

const rifter = {
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
  ],
};

const meta = {
  component: FittingWheel,
} satisfies Meta<typeof FittingWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyRifter: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("region", { name: "Fitting" })).toBeInTheDocument();
    // A Rifter has 3 high, 3 medium and 4 low slots of 8 each, and 3 rig slots.
    await expect(canvasElement.querySelectorAll('[data-state="empty"]')).toHaveLength(13);
    await expect(canvasElement.querySelectorAll('[data-state="unavailable"]')).toHaveLength(14);
    await expect(canvas.getByRole("meter", { name: "Calibration" })).toHaveAttribute(
      "aria-valuetext",
      "0 / 400 points",
    );
  },
};

export const FittedRifter: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    const states = Array.from(canvasElement.querySelectorAll("[data-state]"), (slot) =>
      slot.getAttribute("data-state"),
    );
    await expect(states.filter((state) => state === "active")).toHaveLength(3);
    await expect(states.filter((state) => state === "overload")).toHaveLength(1);
    await expect(states.filter((state) => state === "online")).toHaveLength(3);
    await expect(states.filter((state) => state === "offline")).toHaveLength(1);
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(4);

    await expect(canvas.getByRole("meter", { name: "CPU" })).not.toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByRole("meter", { name: "Calibration" })).not.toHaveAttribute("aria-valuenow", "0");
  },
};

export const ClickToSwitch: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, active");

    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, overload");
    await userEvent.click(afterburner());
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");

    await userEvent.keyboard("{Shift>}");
    await userEvent.click(afterburner());
    await userEvent.keyboard("{/Shift}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, overload");

    const damageControl = () => canvas.getByRole("button", { name: /^Damage Control II/ });
    await userEvent.click(damageControl());
    await expect(damageControl()).toHaveAccessibleName("Damage Control II, offline");
    await userEvent.click(damageControl());
    await expect(damageControl()).toHaveAccessibleName("Damage Control II, online");
  },
};

export const RigsStayOnline: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: /^Small Projectile Burst Aerator I/ })).toBeNull();
    const rig = within(canvas.getByRole("group", { name: "Small Projectile Burst Aerator I" }));
    await expect(rig.getByRole("button", { name: "Unfit Module" })).toBeInTheDocument();
    await expect(rig.queryByRole("button", { name: /^Put / })).toBeNull();
  },
};

/** Focused, as it only takes the pointer while its slot is hovered, which a test cannot do. */
function focusAction(canvas: ReturnType<typeof within>, module: string, action: string, nth = 0): HTMLElement {
  const group = canvas.getAllByRole("group", { name: module })[nth]!;
  const button = within(group).getByRole("button", { name: action });
  button.focus();
  return button;
}

export const Unfit: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    focusAction(canvas, "1MN Afterburner II", "Unfit Module");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("button", { name: /^1MN Afterburner II/ })).toBeNull();
    await expect(canvas.queryByRole("group", { name: "1MN Afterburner II" })).toBeNull();

    focusAction(canvas, "Small Projectile Burst Aerator I", "Unfit Module");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("group", { name: "Small Projectile Burst Aerator I" })).toBeNull();
  },
};

export const RemoveCharge: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement, userEvent }) => {
    focusAction(canvas, "200mm AutoCannon II", "Remove Charge");
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(0);
    await expect(canvas.queryByRole("button", { name: "Remove Charge" })).toBeNull();
    await expect(canvas.getAllByRole("button", { name: /^200mm AutoCannon II/ })).toHaveLength(2);
  },
};

export const PutOfflineAndOnline: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, userEvent }) => {
    const afterburner = () => canvas.getByRole("button", { name: /^1MN Afterburner II/ });

    focusAction(canvas, "1MN Afterburner II", "Put Offline");
    await userEvent.keyboard("{Enter}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, offline");

    focusAction(canvas, "1MN Afterburner II", "Put Online");
    await userEvent.keyboard("{Enter}");
    await expect(afterburner()).toHaveAccessibleName("1MN Afterburner II, online");
  },
};

const lowSlots = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll("[data-state]")).slice(16, 20);
const moduleIn = (slot: Element) =>
  slot.querySelector("[role=button]")?.getAttribute("aria-label") ?? slot.getAttribute("data-state");

/** Dropping a fitted module on another of its rack swaps them; on an empty slot, it moves there. */
export const DragToMove: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    await dragAndDrop(
      canvas.getByRole("button", { name: /^Damage Control II/ }),
      canvas.getByRole("button", { name: /^Gyrostabilizer II/ }),
    );
    await expect(lowSlots(canvasElement).map(moduleIn)).toEqual([
      "Gyrostabilizer II, offline",
      "Damage Control II, online",
      "empty",
      "empty",
    ]);

    await dragAndDrop(canvas.getByRole("button", { name: /^Damage Control II/ }), lowSlots(canvasElement)[3]!);
    await expect(lowSlots(canvasElement).map(moduleIn)).toEqual([
      "Gyrostabilizer II, offline",
      "empty",
      "empty",
      "Damage Control II, online",
    ]);
  },
};

/** A module does not go in a slot of another rack. */
export const DragToOtherRack: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    const dataTransfer = new DataTransfer();
    const damageControl = canvas.getByRole("button", { name: /^Damage Control II/ });
    await fireEvent.dragStart(damageControl, { dataTransfer });
    const emptyMedium = canvasElement.querySelectorAll("[data-state]")[10]!;
    await expect(emptyMedium).toHaveAttribute("data-state", "empty");
    await waitFor(async () =>
      expect(await fireEvent.dragOver(lowSlots(canvasElement)[2]!, { dataTransfer })).toBe(false),
    );
    await expect(await fireEvent.dragOver(emptyMedium, { dataTransfer })).toBe(true);
    await fireEvent.drop(emptyMedium, { dataTransfer });
    await fireEvent.dragEnd(damageControl, { dataTransfer });
    await expect(moduleIn(lowSlots(canvasElement)[0]!)).toBe("Damage Control II, online");
  },
};

/** Dragging over a slot previews the drop there, until the drag leaves the wheel. */
export const DragPreview: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    const previewed = () =>
      Array.from(canvasElement.querySelectorAll("[data-state]"), (slot) => slot.hasAttribute("data-preview"))
        .map((preview, index) => (preview ? index : undefined))
        .filter((index) => index !== undefined);
    const [, gyrostabilizer, empty] = lowSlots(canvasElement);
    const dataTransfer = new DataTransfer();
    const damageControl = canvas.getByRole("button", { name: /^Damage Control II/ });
    await fireEvent.dragStart(damageControl, { dataTransfer });

    await waitFor(async () => {
      await fireEvent.dragEnter(empty!, { dataTransfer });
      await expect(previewed()).toEqual([18]);
    });

    await fireEvent.dragEnter(gyrostabilizer!, { dataTransfer });
    await fireEvent.dragLeave(empty!, { dataTransfer, relatedTarget: gyrostabilizer });
    await waitFor(() => expect(previewed()).toEqual([16, 17]));

    await fireEvent.dragLeave(gyrostabilizer!, { dataTransfer, relatedTarget: document.body });
    await waitFor(() => expect(previewed()).toEqual([]));
    await fireEvent.dragEnd(damageControl, { dataTransfer });
  },
};

/** Dropping a fitted module, or a rig, in the middle of the wheel unfits it. */
export const DragToUnfit: Story = {
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    const centre = canvasElement.querySelector("[data-centre]")!;
    await dragAndDrop(canvas.getByRole("button", { name: /^Gyrostabilizer II/ }), centre);
    await expect(canvas.queryByRole("button", { name: /^Gyrostabilizer II/ })).toBeNull();

    const rig = canvas.getByRole("group", { name: "Small Projectile Burst Aerator I" }).closest("[data-state]")!;
    await dragAndDrop(rig.querySelector("[draggable]")!, centre);
    await expect(canvas.queryByRole("group", { name: "Small Projectile Burst Aerator I" })).toBeNull();
  },
};

/** Nothing on a read-only wheel can be pressed, hovered or dragged. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  parameters: { fit: rifter },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-state="active"]')).toHaveLength(3);
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(canvas.queryByRole("group")).toBeNull();
    await expect(canvasElement.querySelector("[draggable=true]")).toBeNull();
    await expect(canvasElement.querySelector("[data-centre]")).toBeNull();
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
