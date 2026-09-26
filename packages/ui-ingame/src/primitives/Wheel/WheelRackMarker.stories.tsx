import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { rackSize, slotAngle, type WheelRack } from "./layout";
import { onAWheel } from "./onAWheel";
import { WheelRackMarker } from "./WheelRackMarker";
import { WheelSlot } from "./WheelSlot";

const racks: WheelRack[] = ["high", "medium", "low", "rig", "subsystem"];
// EVE draws the high, medium and low slots a ship does not have as a faint outline; the others it leaves out.
const drawnInFull: WheelRack[] = ["high", "medium", "low"];

function Racks({ slots }: { slots: Record<WheelRack, number> }) {
  return (
    <>
      <WheelRackMarker rack="high" />
      <WheelRackMarker rack="medium" />
      <WheelRackMarker rack="low" />
      {racks.flatMap((rack) =>
        Array.from({ length: drawnInFull.includes(rack) ? rackSize(rack) : slots[rack] }, (_, index) => (
          <WheelSlot
            key={`${rack}-${index}`}
            rack={rack}
            angle={slotAngle(rack, index)}
            available={index < slots[rack]}
            data-rack={rack}
          />
        )),
      )}
    </>
  );
}

const meta = {
  component: WheelRackMarker,
  args: { rack: "high" },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelRackMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector<HTMLImageElement>("img[data-marker=high]");
    await waitFor(() => expect(marker?.naturalWidth).toBe(16));
  },
};

export const Medium: Story = {
  args: { rack: "medium" },
};

export const Low: Story = {
  args: { rack: "low" },
};

/** Every slot the wheel has room for, in every rack. */
export const EveryRack: Story = {
  render: () => (
    <Racks
      slots={{
        high: rackSize("high"),
        medium: rackSize("medium"),
        low: rackSize("low"),
        rig: rackSize("rig"),
        subsystem: rackSize("subsystem"),
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-rack=high][data-state=empty]")).toHaveLength(8);
    await expect(canvasElement.querySelectorAll("[data-rack=rig][data-state=empty]")).toHaveLength(3);
    await expect(canvasElement.querySelectorAll("[data-rack=subsystem][data-state=empty]")).toHaveLength(4);
  },
};

/** A Rifter: as in EVE, the high, medium and low slots it does not have are faint, and the subsystems left out. */
export const Rifter: Story = {
  render: () => <Racks slots={{ high: 4, medium: 3, low: 3, rig: 3, subsystem: 0 }} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-rack=high][data-state=empty]")).toHaveLength(4);
    await expect(canvasElement.querySelectorAll("[data-rack=high][data-state=unavailable]")).toHaveLength(4);
    await expect(canvasElement.querySelectorAll("[data-rack=subsystem]")).toHaveLength(0);
  },
};
