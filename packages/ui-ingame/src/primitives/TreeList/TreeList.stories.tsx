import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { TreeGroup, TreeLeaf, TreeList } from "./TreeList";

const onActivate = fn();

const ships: Record<string, Record<string, Record<string, number>>> = {
  Frigate: {
    Amarr: { Punisher: 597, Executioner: 589, Tormentor: 591 },
    Caldari: { Merlin: 603, Kestrel: 602, Condor: 583 },
    Gallente: { Incursus: 594, Tristan: 593, Atron: 608 },
    Minmatar: { Rifter: 587, Slasher: 585, Breacher: 598 },
  },
  Destroyer: {
    Amarr: { Coercer: 16236 },
    Caldari: { Cormorant: 16238 },
    Gallente: { Catalyst: 16240 },
    Minmatar: { Thrasher: 16242 },
  },
  Cruiser: {
    Amarr: { Omen: 2006, Maller: 624 },
    Caldari: { Caracal: 621, Moa: 623 },
    Gallente: { Thorax: 627, Vexor: 626 },
    Minmatar: { Rupture: 629, Stabber: 622 },
  },
  Battlecruiser: {
    Amarr: { Harbinger: 24696, Prophecy: 16233 },
    Caldari: { Drake: 24698, Ferox: 16227 },
    Gallente: { Brutix: 16229, Myrmidon: 24700 },
    Minmatar: { Hurricane: 24702, Cyclone: 16231 },
  },
  Battleship: {
    Amarr: { Apocalypse: 642, Armageddon: 643 },
    Caldari: { Raven: 638, Scorpion: 640 },
    Gallente: { Megathron: 641, Dominix: 645 },
    Minmatar: { Tempest: 639, Typhoon: 644 },
  },
};

function shipTree(open: boolean) {
  return Object.entries(ships).map(([shipClass, races]) => (
    <TreeGroup key={shipClass} label={shipClass} defaultOpen={open}>
      {() =>
        Object.entries(races).map(([race, hulls]) => (
          <TreeGroup key={race} label={race} defaultOpen={open}>
            {() =>
              Object.entries(hulls).map(([name, typeId]) => (
                <TreeLeaf key={name} label={name} typeId={typeId} onActivate={onActivate} />
              ))
            }
          </TreeGroup>
        ))
      }
    </TreeGroup>
  ));
}

const meta = {
  component: TreeList,
  args: { label: "Ships", children: shipTree(false) },
} satisfies Meta<typeof TreeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByText("Minmatar")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: /Frigate/ }));
    await userEvent.click(canvas.getByRole("button", { name: /Minmatar/ }));
    await userEvent.dblClick(canvas.getByRole("button", { name: /Rifter/ }));
    await expect(onActivate).toHaveBeenCalledOnce();

    canvas.getByRole("button", { name: /Rifter/ }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(onActivate).toHaveBeenCalledTimes(2);
  },
};

export const Expanded: Story = {
  args: { children: shipTree(true) },
};

export const WithoutIcons: Story = {
  args: {
    label: "Fits",
    children: (
      <>
        <TreeLeaf label="Autocannon brawler" />
        <TreeLeaf label="Arty kiter" />
      </>
    ),
  },
};

export const WithTrailingContent: Story = {
  args: {
    label: "Cargo",
    children: (
      <>
        <TreeLeaf label="Nanite Repair Paste" typeId={28668} after="×50" />
        <TreeLeaf label="Hammerhead II" typeId={2185} after="×5" />
      </>
    ),
  },
};

export const LongLabels: Story = {
  args: {
    children: (
      <TreeGroup label="Frigate" defaultOpen>
        {() => (
          <TreeLeaf
            label="Rifter with a very long fit name that does not fit in the list"
            title="Rifter with a very long fit name that does not fit in the list"
            typeId={587}
          />
        )}
      </TreeGroup>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    ),
  ],
};
