import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelAugmentationSlot } from "./WheelAugmentationSlot";
import { WheelAugmentationTrack } from "./WheelAugmentationTrack";

const types = { "High-grade Snake Alpha": 19540, "Synth Exile Booster": 28676, "Synth Drop Booster": 28674 };

const meta = {
  component: WheelAugmentationSlot,
  args: { kind: "implant", position: 0, number: 1 },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelAugmentationSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyImplant: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("1")).toBeVisible();
  },
};

/** Ten implant slots down the left, three boosters and an empty slot on the right, at the same heights. */
export const Tracks: Story = {
  render: () => (
    <>
      <WheelAugmentationTrack kind="implant" length={10} />
      {Array.from({ length: 10 }, (_, position) => (
        <WheelAugmentationSlot
          key={position}
          kind="implant"
          position={position}
          number={position + 1}
          typeId={position === 0 ? types["High-grade Snake Alpha"] : undefined}
        />
      ))}
      <WheelAugmentationTrack kind="booster" length={3} />
      <WheelAugmentationSlot kind="booster" position={0} typeId={types["Synth Exile Booster"]} />
      <WheelAugmentationSlot kind="booster" position={1} typeId={types["Synth Drop Booster"]} />
      <WheelAugmentationSlot kind="booster" position={2} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const implant = canvasElement.querySelector<HTMLElement>("[data-kind=implant]")!;
    const booster = canvasElement.querySelector<HTMLElement>("[data-kind=booster]")!;
    await expect(implant.getBoundingClientRect().top).toBeCloseTo(booster.getBoundingClientRect().top);
  },
};

export const Preview: Story = {
  args: { typeId: types["High-grade Snake Alpha"], preview: true },
};
