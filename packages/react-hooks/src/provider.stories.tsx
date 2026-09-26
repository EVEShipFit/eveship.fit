import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { useAttribute } from "./hooks/attribute.js";
import { useFit } from "./hooks/fit.js";
import { useType } from "./hooks/sde.js";
import { useSlots } from "./hooks/slots.js";

/** The provider with the real engine in a real browser; the hooks themselves are tested in `test/`. */
function Smoke() {
  const ship = useType(useFit().ship.type_id);
  const cpu = useAttribute("cpuOutput");
  const lows = useSlots("low");

  return (
    <dl>
      <dt>Ship</dt>
      <dd aria-label="Ship">{ship?.name}</dd>
      <dt>CPU</dt>
      <dd aria-label="CPU">{cpu.text}</dd>
      <dt>Low slots</dt>
      <dd aria-label="Low slots">{lows.length}</dd>
    </dl>
  );
}

const meta = {
  title: "react-hooks/Provider",
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loads: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Ship")).toHaveTextContent("Rifter");
    await expect(canvas.getByLabelText("CPU")).toHaveTextContent(/^[\d.]+ tf$/);
    await expect(canvas.getByLabelText("Low slots")).toHaveTextContent("4");
  },
};
