import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import { useContextMenu, type ContextMenuEntry } from "./ContextMenu";

function Target({ entries }: { entries: (ContextMenuEntry | false)[] }) {
  const { open, menu } = useContextMenu();
  return (
    <>
      <button type="button" onContextMenu={(event) => open(event, entries)}>
        Right click me
      </button>
      {menu}
    </>
  );
}

const meta = {
  component: Target,
  args: {
    entries: [
      { label: "Show Info", icon: "module-info", onSelect: fn() },
      "separator",
      false,
      "separator",
      { label: "Unfit", icon: "module-unfit", onSelect: fn() },
      { label: "Put Offline", icon: "module-power", onSelect: fn() },
      "separator",
    ],
  },
  decorators: [(Story) => <div style={{ padding: 40 }}>{Story()}</div>],
} satisfies Meta<typeof Target>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, args, userEvent }) => {
    await fireEvent.contextMenu(canvas.getByRole("button", { name: "Right click me" }));
    await expect(canvas.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Show Info",
      "Unfit",
      "Put Offline",
    ]);
    await expect(canvasElement.querySelectorAll("hr")).toHaveLength(1);

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    const unfit = args.entries[4] as { onSelect: () => void };
    await expect(unfit.onSelect).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
};

export const EscapeCloses: Story = {
  play: async ({ canvas, args, userEvent }) => {
    await fireEvent.contextMenu(canvas.getByRole("button", { name: "Right click me" }));
    await expect(canvas.getByRole("menu")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    const info = args.entries[0] as { onSelect: () => void };
    await expect(info.onSelect).not.toHaveBeenCalled();
  },
};

export const NothingToShow: Story = {
  args: { entries: [false, "separator"] },
  play: async ({ canvas }) => {
    const shown = await fireEvent.contextMenu(canvas.getByRole("button", { name: "Right click me" }));
    await expect(shown).toBe(true);
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
};
