import type { Images } from "@eveshipfit/images";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

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

/** Each rack's empty slot has its own icon, which turns with the slot. */
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

/** The bars along the outer edge show whether ammo is loaded. */
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

/** Every look, around the wheel; icons stay upright wherever the slot is. */
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
