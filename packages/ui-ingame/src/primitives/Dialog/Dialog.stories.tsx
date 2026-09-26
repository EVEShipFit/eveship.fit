import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { Dialog, type DialogProps } from "./Dialog";

function Example({ open: initiallyOpen, onClose, ...props }: DialogProps) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        {...props}
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}

const meta = {
  component: Dialog,
  args: { open: true, title: "Import fit", onClose: fn(), children: "Paste an EFT fit or a share link." },
  render: (args) => <Example key={String(args.open)} {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("dialog", { name: "Import fit" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

export const Closed: Story = {
  args: { open: false },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    await expect(await canvas.findByRole("dialog", { name: "Import fit" })).toBeVisible();
  },
};

export const LongTitle: Story = {
  args: { title: "Import a fit from EFT, a share link or a killmail and replace the one being edited" },
};

export const LongContent: Story = {
  args: {
    children: Array.from({ length: 60 }, (_, index) => <p key={index}>Line {index + 1}</p>),
  },
};
