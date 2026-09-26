import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";

import { rackSize, slotAngle, type WheelRack } from "./layout";
import { Wheel } from "./Wheel";
import { WheelGauge } from "./WheelGauge";
import { WheelHardpoints } from "./WheelHardpoints";
import { WheelHull } from "./WheelHull";
import { WheelRackMarker } from "./WheelRackMarker";
import { WheelSlot, type WheelSlotProps } from "./WheelSlot";

const meta = {
  component: Wheel,
  args: { label: "Fitting" },
} satisfies Meta<typeof Wheel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    const wheel = canvas.getByRole("region", { name: "Fitting" });
    const { width, height } = wheel.getBoundingClientRect();
    await expect(width).toBe(480);
    await expect(height).toBe(width);
  },
};

export const Small: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "240px" } as CSSProperties}>{Story()}</div>],
};

export const Large: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "730px" } as CSSProperties}>{Story()}</div>],
};

export const FillsItsContainer: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "100%", width: 360 } as CSSProperties}>{Story()}</div>],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Fitting" }).getBoundingClientRect().width).toBe(360);
  },
};

/** The rings are black and partly see-through, so they show best on top of the ship. */
export const OnABackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "radial-gradient(circle, #7a4a4a, #2a1a1f 70%)", width: "fit-content" }}>{Story()}</div>
    ),
  ],
};

// EVE draws the high, medium and low slots a ship does not have as a faint outline; the others it leaves out.
const drawnInFull: WheelRack[] = ["high", "medium", "low"];

const rifter: Record<WheelRack, { slots: number; fitted: Omit<WheelSlotProps, "rack" | "angle">[] }> = {
  high: {
    slots: 4,
    fitted: [
      { typeId: 2889, chargeTypeId: 185, chargeable: true, activatable: true, state: "active" },
      { typeId: 2889, chargeTypeId: 185, chargeable: true, activatable: true, state: "overload" },
      { typeId: 10631, chargeable: true, activatable: true, state: "active" },
    ],
  },
  medium: {
    slots: 3,
    fitted: [
      { typeId: 438, activatable: true, state: "active" },
      { typeId: 527, activatable: true },
    ],
  },
  low: {
    slots: 3,
    fitted: [
      { typeId: 2048, activatable: true },
      { typeId: 519, state: "offline" },
    ],
  },
  rig: { slots: 3, fitted: [{ typeId: 31668 }] },
  subsystem: { slots: 0, fitted: [] },
};

/** A fitted Rifter, with every part of the wheel, as EVE's simulation shows it. */
export const Rifter: Story = {
  decorators: [(Story) => <div style={{ "--esf-wheel-size": "730px" } as CSSProperties}>{Story()}</div>],
  render: (args) => (
    <Wheel {...args}>
      <WheelHull typeId={587} />
      <WheelRackMarker rack="high" />
      <WheelRackMarker rack="medium" />
      <WheelRackMarker rack="low" />
      {(Object.keys(rifter) as WheelRack[]).flatMap((rack) =>
        Array.from({ length: drawnInFull.includes(rack) ? rackSize(rack) : rifter[rack].slots }, (_, index) => (
          <WheelSlot
            key={`${rack}-${index}`}
            rack={rack}
            angle={slotAngle(rack, index)}
            available={index < rifter[rack].slots}
            {...rifter[rack].fitted[index]}
          />
        )),
      )}
      <WheelHardpoints turrets={{ used: 2, total: 3 }} launchers={{ used: 1, total: 2 }} />
      <WheelGauge resource="cpu" used={61.3} total={162.5} />
      <WheelGauge resource="powergrid" used={27.1} total={51.3} />
      <WheelGauge resource="calibration" used={100} total={400} />
    </Wheel>
  ),
};
