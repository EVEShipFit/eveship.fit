import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

import { onAWheel } from "./onAWheel";
import { WheelModes, type WheelModesProps } from "./WheelModes";

const confessor = [
  { typeId: 34319, name: "Confessor Defense Mode" },
  { typeId: 34321, name: "Confessor Sharpshooter Mode" },
  { typeId: 34323, name: "Confessor Propulsion Mode" },
];

const meta = {
  component: WheelModes,
  args: { modes: confessor, active: 34319 },
  decorators: [onAWheel],
} satisfies Meta<typeof WheelModes>;

export default meta;
type Story = StoryObj<typeof meta>;

function Switching(props: WheelModesProps) {
  const [active, setActive] = useState(props.active);
  return <WheelModes {...props} active={active} onSelect={setActive} />;
}

export const Confessor: Story = {
  render: (args) => <Switching {...args} />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("radio", { name: "Confessor Defense Mode" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Confessor Propulsion Mode" }));
    await expect(canvas.getByRole("radio", { name: "Confessor Propulsion Mode" })).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Confessor Defense Mode" })).not.toBeChecked();
  },
};

export const ReadOnly: Story = {
  play: async ({ canvas }) => {
    for (const mode of canvas.getAllByRole("radio")) await expect(mode).toBeDisabled();
  },
};
