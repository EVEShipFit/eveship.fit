import type { Images } from "@eveshipfit/images";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelSlot, type WheelSlotProps } from "./WheelSlot";

const types = {
  "200mm AutoCannon II": 2889,
  "EMP S": 185,
  "1MN Afterburner II": 438,
  "Damage Control II": 2048,
  "Gyrostabilizer II": 519,
};

const meta = {
  component: WheelSlot,
  args: { rack: "high", angle: 0 },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-state]")).toHaveAttribute("data-state", "empty");
  },
};

export const EmptyInEachRack: Story = {
  render: () => (
    <>
      <WheelSlot rack="high" angle={-20} />
      <WheelSlot rack="high" angle={0} />
      <WheelSlot rack="medium" angle={70} />
      <WheelSlot rack="medium" angle={90} />
      <WheelSlot rack="low" angle={160} />
      <WheelSlot rack="low" angle={180} />
      <WheelSlot rack="rig" angle={-62} />
      <WheelSlot rack="subsystem" angle={-107} />
    </>
  ),
  play: async ({ canvasElement }) => {
    for (const rack of ["high", "medium", "low", "rig", "subsystem"]) {
      await expect(canvasElement.querySelector(`[data-icon="slot-${rack}"]`)).toBeInTheDocument();
    }
  },
};

export const Unavailable: Story = {
  args: { available: false },
};

export const Online: Story = {
  args: { typeId: types["Gyrostabilizer II"] },
};

export const Offline: Story = {
  args: { typeId: types["Gyrostabilizer II"], state: "offline" },
};

export const Activatable: Story = {
  args: { typeId: types["1MN Afterburner II"], activatable: true },
};

export const Active: Story = {
  args: { typeId: types["1MN Afterburner II"], activatable: true, state: "active" },
};

export const Overload: Story = {
  args: { typeId: types["1MN Afterburner II"], activatable: true, state: "overload" },
};

export const WithoutCharge: Story = {
  args: { typeId: types["200mm AutoCannon II"], chargeable: true, activatable: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(0);
  },
};

export const WithCharge: Story = {
  args: {
    typeId: types["200mm AutoCannon II"],
    chargeTypeId: types["EMP S"],
    chargeable: true,
    activatable: true,
    state: "active",
  },
  play: async ({ canvasElement, loaded }) => {
    const charge = (loaded.images as Images).typeIcon(types["EMP S"])?.[0];
    const icon = canvasElement.querySelector("[data-state] img");
    await expect(icon).toHaveAttribute("src", charge?.src);
    await expect(canvasElement.querySelectorAll("[data-loaded]")).toHaveLength(4);
  },
};

export const Preview: Story = {
  args: { typeId: types["Damage Control II"], activatable: true, preview: true },
};

export const Pressable: Story = {
  args: { typeId: types["1MN Afterburner II"], activatable: true, label: "1MN Afterburner II", onPress: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "1MN Afterburner II" }));
    await expect(args.onPress).toHaveBeenCalledOnce();
  },
};

/** Keyboard users reach the actions after the slot. */
export const Actions: Story = {
  args: {
    typeId: types["1MN Afterburner II"],
    typeName: "1MN Afterburner II",
    activatable: true,
    state: "active",
    label: "1MN Afterburner II, active",
    onPress: fn(),
    onUnfit: fn(),
    onTogglePower: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const actions = canvas.getByRole("group", { name: "1MN Afterburner II" });
    await expect(actions).not.toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Remove Charge" })).toBeNull();

    await userEvent.tab();
    await expect(actions).toBeVisible();
    await userEvent.tab();
    const unfit = canvas.getByRole("button", { name: "Unfit Module" });
    await expect(unfit).toHaveFocus();
    // 13.5 of the wheel's 464 units.
    await expect(unfit.getBoundingClientRect().width).toBeCloseTo((13.5 / 464) * 730, 0);
    await userEvent.keyboard("{Enter}");
    await expect(args.onUnfit).toHaveBeenCalledOnce();

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Show Info" })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByText("Show Info (not implemented yet)")).toBeVisible();

    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Put Offline" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onTogglePower).toHaveBeenCalledOnce();
  },
};

/** With a charge loaded, the slot shows the charge; the actions show the module, and can remove the charge. */
export const ActionsWithCharge: Story = {
  args: {
    typeId: types["200mm AutoCannon II"],
    typeName: "200mm AutoCannon II",
    chargeTypeId: types["EMP S"],
    chargeable: true,
    activatable: true,
    state: "active",
    label: "200mm AutoCannon II, active",
    onPress: fn(),
    onUnfit: fn(),
    onRemoveCharge: fn(),
    onTogglePower: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab();
    const names = within(canvas.getByRole("group", { name: "200mm AutoCannon II" }))
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"));
    await expect(names).toEqual(["Remove Charge", "Show Info", "Unfit Module", "Show Info", "Put Offline"]);
    await expect(canvas.getByText("200mm AutoCannon II")).toBeInTheDocument();

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(args.onRemoveCharge).toHaveBeenCalledOnce();
  },
};

export const ActionsOffline: Story = {
  args: {
    typeId: types["Gyrostabilizer II"],
    typeName: "Gyrostabilizer II",
    state: "offline",
    onUnfit: fn(),
    onTogglePower: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Put Online" })).toBeInTheDocument();
  },
};

/** Without an `onPress`, like a rig, the actions are the first to get keyboard focus. */
export const ActionsOnly: Story = {
  args: {
    rack: "rig",
    angle: -73.25,
    typeId: types["Gyrostabilizer II"],
    typeName: "Gyrostabilizer II",
    onUnfit: fn(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Unfit Module" })).toHaveFocus();
    await expect(canvas.getByRole("group", { name: "Gyrostabilizer II" })).toBeVisible();
  },
};

const every: Omit<WheelSlotProps, "rack" | "angle">[] = [
  { available: false },
  {},
  { typeId: types["Gyrostabilizer II"], state: "offline" },
  { typeId: types["Gyrostabilizer II"] },
  { typeId: types["1MN Afterburner II"], activatable: true },
  { typeId: types["1MN Afterburner II"], activatable: true, state: "active" },
  { typeId: types["1MN Afterburner II"], activatable: true, state: "overload" },
  { typeId: types["200mm AutoCannon II"], chargeable: true, activatable: true },
  {
    typeId: types["200mm AutoCannon II"],
    chargeTypeId: types["EMP S"],
    chargeable: true,
    activatable: true,
    state: "active",
  },
  { typeId: types["Damage Control II"], activatable: true, preview: true },
];

export const AllStates: Story = {
  render: () => (
    <>
      {every.map((props, index) => (
        <WheelSlot key={index} rack="high" angle={-40 + index * 10.2} {...props} />
      ))}
      {every.map((props, index) => (
        <WheelSlot key={index} rack="low" angle={140 + index * 10.2} {...props} />
      ))}
    </>
  ),
};
