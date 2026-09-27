import type { Placement } from "@eveshipfit/fitting";
import {
  useCanFit,
  useDrag,
  useFitStore,
  useImages,
  useMissingSkills,
  useModuleTree,
  usePlacement,
  usePreview,
} from "@eveshipfit/react-hooks";
import type { MetaFolder, ModuleGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { useState, type DragEvent } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";

type SlotFilter = "low" | "medium" | "high" | "rig" | "drones";
type Place = Placement["type"];

const slotFilters: { filter: SlotFilter; icon: IconName; label: string; places: readonly Place[] }[] = [
  { filter: "low", icon: "filter-low-slot", label: "Low Slot", places: ["low"] },
  { filter: "medium", icon: "filter-medium-slot", label: "Mid Slot", places: ["medium"] },
  { filter: "high", icon: "filter-high-slot", label: "High Slot", places: ["high"] },
  { filter: "rig", icon: "filter-rig-slot", label: "Rig & Subsystem Slots", places: ["rig", "subsystem"] },
  { filter: "drones", icon: "filter-drones", label: "Drones", places: ["drone_bay", "fighter_bay"] },
];

const folders: Record<MetaFolder, { label: string; metaGroupId: number }> = {
  faction: { label: "Faction & Storyline", metaGroupId: 4 },
  officer: { label: "Officer", metaGroupId: 5 },
  deadspace: { label: "Deadspace", metaGroupId: 6 },
};

const MOST_OPENED_BY_SEARCH = 200;

/** The Modules tab of the `ItemBrowser`: what goes on a ship, by market group. */
export function Modules() {
  const store = useFitStore();
  const { show, clear } = usePreview();
  const { start, end } = useDrag();
  const placement = usePlacement();
  const canFit = useCanFit();
  const missingSkills = useMissingSkills();
  const [search, setSearch] = useState("");
  const [slots, setSlots] = useState<ReadonlySet<SlotFilter>>(() => new Set());
  const [hullRestrictions, setHullRestrictions] = useState(false);
  const [flyable, setFlyable] = useState(false);
  const [collapsed, setCollapsed] = useState<{ times: number; query?: string }>({ times: 0 });

  const query = search.trim().toLowerCase();
  const places = new Set(slotFilters.filter(({ filter }) => slots.has(filter)).flatMap((slot) => slot.places));

  const groups = useModuleTree(
    query !== "" || places.size > 0 || hullRestrictions || flyable
      ? (type) => {
          if (places.size > 0) {
            const place = placement(type)?.type;
            if (place === undefined || !places.has(place)) return false;
          }
          if (hullRestrictions && !canFit(type)) return false;
          if (flyable && missingSkills([type.id]).length > 0) return false;
          return type.name.toLowerCase().includes(query);
        }
      : undefined,
  );

  const open = query !== "" && query !== collapsed.query && countTypes(groups) <= MOST_OPENED_BY_SEARCH;

  const actions: ModuleActions = {
    fit: (typeId) => void store.fit(typeId),
    hover: (typeId, hovering) => {
      if (hovering) show((draft) => void draft.fit(typeId));
      else clear();
    },
    drag: (event, type) => {
      clear();
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", type.name);
      start({ type: "type", typeId: type.id });
    },
    dragEnd: end,
  };

  const toggleSlot = (filter: SlotFilter, pressed: boolean) => {
    const next = new Set(slots);
    if (pressed) next.add(filter);
    else next.delete(filter);
    setSlots(next);
  };

  return (
    <>
      <Search
        value={search}
        onChange={(value) => {
          clear();
          setSearch(value);
        }}
        onCollapse={() => setCollapsed({ times: collapsed.times + 1, query })}
      />
      <fieldset className={styles.filters} aria-label="Filters">
        {slotFilters.map(({ filter, icon, label }) => (
          <FilterToggle
            key={filter}
            icon={icon}
            label={label}
            pressed={slots.has(filter)}
            onPressedChange={(pressed) => toggleSlot(filter, pressed)}
          />
        ))}
        <FilterToggle
          icon="filter-hull-restrictions"
          label="Hull Restrictions"
          pressed={hullRestrictions}
          onPressedChange={setHullRestrictions}
        />
        <FilterToggle icon="filter-resources" label="Resources" />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
      </fieldset>
      <div className={styles.tree}>
        <TreeList key={`${collapsed.times}-${open}`} label="Modules">
          {groups.map((node) => (
            <ModuleGroup key={node.group.id} node={node} open={open} actions={actions} />
          ))}
        </TreeList>
      </div>
    </>
  );
}

interface ModuleActions {
  fit: (typeId: number) => void;
  hover: (typeId: number, hovering: boolean) => void;
  drag: (event: DragEvent, type: SdeType) => void;
  dragEnd: () => void;
}

interface ModuleGroupProps {
  node: ModuleGroupNode;
  open: boolean;
  actions: ModuleActions;
}

function ModuleGroup({ node, open, actions }: ModuleGroupProps) {
  const images = useImages();

  return (
    <TreeGroup label={node.group.name} icon={images.marketGroupIcon(node.group.id)} defaultOpen={open}>
      {() => (
        <>
          {node.children.map((child) => (
            <ModuleGroup key={child.group.id} node={child} open={open} actions={actions} />
          ))}
          {node.types.map((type) => (
            <Module key={type.id} type={type} actions={actions} />
          ))}
          {node.folders.map(({ folder, types }) => (
            <TreeGroup
              key={folder}
              label={folders[folder].label}
              icon={images.metaGroupIcon(folders[folder].metaGroupId)}
              defaultOpen={open}
            >
              {() => types.map((type) => <Module key={type.id} type={type} actions={actions} />)}
            </TreeGroup>
          ))}
        </>
      )}
    </TreeGroup>
  );
}

function Module({ type, actions }: { type: SdeType; actions: ModuleActions }) {
  return (
    <TreeLeaf
      label={type.name}
      onActivate={() => actions.fit(type.id)}
      onHover={(hovering) => actions.hover(type.id, hovering)}
      onDragStart={(event) => actions.drag(event, type)}
      onDragEnd={actions.dragEnd}
      after={
        <Tooltip label="Show Info (not implemented yet)">
          <button
            type="button"
            className={styles.info}
            aria-label={`Show Info on ${type.name}`}
            aria-disabled
            tabIndex={-1}
          >
            <Icon name="module-info" />
          </button>
        </Tooltip>
      }
    />
  );
}

function countTypes(nodes: readonly ModuleGroupNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += countTypes(node.children) + node.types.length;
    for (const folder of node.folders) count += folder.types.length;
  }
  return count;
}
