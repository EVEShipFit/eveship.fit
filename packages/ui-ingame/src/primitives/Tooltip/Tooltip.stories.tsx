import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, waitFor, within } from "storybook/test";

import { Icon } from "../Icon/Icon";
import { Tooltip, TooltipText } from "./Tooltip";

const button: CSSProperties = {
  background: "none",
  border: "1px solid var(--esf-border)",
  borderRadius: "50%",
  display: "grid",
  height: 24,
  padding: 0,
  placeItems: "center",
  width: 24,
};

const meta = {
  component: Tooltip,
  args: {
    label: "Unfit Module",
    children: (
      <button type="button" style={button} aria-label="Unfit Module">
        <Icon name="slot-high" />
      </button>
    ),
  },
  decorators: [
    (Story, { parameters }) => (
      <div
        style={{
          display: "flex",
          justifyContent: parameters.align ?? "center",
          padding: parameters.padding ?? "80px 0",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function centre(element: Element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** The tooltip showing `label`, and the centres of its notch and of what it points at. */
function tooltipOf(canvasElement: HTMLElement, label: string) {
  const text = within(canvasElement).getByText(label);
  const box = text.parentElement!;
  return {
    box,
    rect: () => box.getBoundingClientRect(),
    notch: () => centre(text.previousElementSibling!),
    anchor: () => centre(box.parentElement!.firstElementChild!),
  };
}

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tooltip = tooltipOf(canvasElement, "Unfit Module");
    await expect(tooltip.box).not.toBeVisible();

    const trigger = canvas.getByRole("button", { name: "Unfit Module" });
    await userEvent.hover(trigger);
    await expect(tooltip.box).toBeVisible();
    await expect(tooltip.rect().bottom).toBeLessThan(trigger.getBoundingClientRect().top);
    await expect(tooltip.notch().x).toBeCloseTo(tooltip.anchor().x, 0);
    await expect(tooltip.notch().y).toBeCloseTo(tooltip.rect().bottom, 0);

    await userEvent.unhover(trigger);
    await expect(tooltip.box).not.toBeVisible();
  },
};

export const Keyboard: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const tooltip = tooltipOf(canvasElement, "Unfit Module");

    await userEvent.tab();
    await expect(tooltip.box).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await expect(tooltip.box).not.toBeVisible();
  },
};

/** Without room above, the tooltip goes below. */
export const Below: Story = {
  parameters: { layout: "fullscreen", padding: 0 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tooltip = tooltipOf(canvasElement, "Unfit Module");
    const trigger = canvas.getByRole("button");

    await userEvent.hover(trigger);
    await expect(tooltip.rect().top).toBeGreaterThan(trigger.getBoundingClientRect().bottom);
    await expect(tooltip.notch().y).toBeCloseTo(tooltip.rect().top, 0);
  },
};

/** At the edge of the page, the tooltip stays on it; the notch still points at its anchor. */
export const AtTheEdge: Story = {
  args: { label: "Remove Charge" },
  parameters: { layout: "fullscreen", align: "start" },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const tooltip = tooltipOf(canvasElement, "Remove Charge");

    await userEvent.hover(canvas.getByRole("button"));
    await expect(tooltip.rect().left).toBeGreaterThanOrEqual(0);
    await waitFor(() => expect(tooltip.notch().x).toBeCloseTo(tooltip.anchor().x, 0));
  },
};

export const LongLabel: Story = {
  args: { label: "Core Probe Launcher I, loaded with Core Scanner Probe I, and a label that has to wrap" },
};

/** A column of buttons, like those of a slot on the fitting wheel; a tooltip does not get in the way of the others. */
export const Column: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 4 }}>
      {["Remove Charge", "Unfit Module", "Put Offline"].map((label) => (
        <Tooltip key={label} label={label}>
          <button type="button" style={button} aria-label={label}>
            <Icon name="slot-high" />
          </button>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "Put Offline" }));
    await expect(tooltipOf(canvasElement, "Put Offline").box).toBeVisible();

    await userEvent.hover(canvas.getByRole("button", { name: "Unfit Module" }));
    await expect(tooltipOf(canvasElement, "Unfit Module").box).toBeVisible();
    await expect(tooltipOf(canvasElement, "Put Offline").box).not.toBeVisible();
  },
};

/** Titled text, like EVE's tooltips of attributes; several stack. */
export const WithText: Story = {
  args: {
    label: (
      <>
        <TooltipText title="Shield Capacity" description="Shield hitpoints recharge over time" />
        <TooltipText title="Shield Recharge Time" description="Amount of time taken to fully recharge the shield" />
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button"));
    await expect(canvas.getByText("Shield Capacity")).toBeVisible();
    await expect(canvas.getByText("Amount of time taken to fully recharge the shield")).toBeVisible();
  },
};
