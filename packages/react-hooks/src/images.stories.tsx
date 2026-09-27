import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { useImages } from "./hooks/images.js";

const RIFTER = 587;

/** The provider with the real images in a real browser. */
function Smoke() {
  const layers = useImages().typeIcon(RIFTER) ?? [];

  return (
    <span>
      {layers.map((layer) => (
        <img key={layer.src} src={layer.src} alt="Rifter" />
      ))}
    </span>
  );
}

const meta = {
  title: "ImagesProvider",
  component: Smoke,
} satisfies Meta<typeof Smoke>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loads: Story = {
  play: async ({ canvas }) => {
    const [icon] = canvas.getAllByRole<HTMLImageElement>("img", { name: "Rifter" });
    await waitFor(() => expect(icon?.naturalWidth).toBe(64));
  },
};
