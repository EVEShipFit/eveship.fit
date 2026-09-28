import type { Placement } from "@eveshipfit/fitting";
import {
  useCanFit,
  useImages,
  useMissingSkills,
  useModuleSearch,
  useModuleTree,
  usePlacement,
} from "@eveshipfit/react-hooks";
import type { ModuleGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import type { IconName } from "../../primitives/Icon/Icon";
import { TreeGroup, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { MOST_OPENED_BY_SEARCH, Search } from "./Search";
import { countLeaves, TypeLeaves, useTypeActions, type TypeActions } from "./TypeLeaf";

type SlotFilter = "low" | "medium" | "high" | "rig" | "drones";
type Place = Placement["type"];

const slotFilters: { filter: SlotFilter; icon: IconName; label: string; places: readonly Place[] }[] = [
  { filter: "low", icon: "filter-low-slot", label: "Low Slot", places: ["low"] },
  { filter: "medium", icon: "filter-medium-slot", label: "Mid Slot", places: ["medium"] },
  { filter: "high", icon: "filter-high-slot", label: "High Slot", places: ["high"] },
  { filter: "rig", icon: "filter-rig-slot", label: "Rig & Subsystem Slots", places: ["rig", "subsystem"] },
  { filter: "drones", icon: "filter-drones", label: "Drones", places: ["drone_bay", "fighter_bay"] },
];

/** The Modules tab of the `ItemBrowser`: what goes on a ship, by market group. */
export function Modules() {
  const { actions, clear, dragImage } = useTypeActions();
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

  const keep =
    query !== "" || places.size > 0 || hullRestrictions || flyable
      ? (type: SdeType) => {
          if (places.size > 0) {
            const place = placement(type)?.type;
            if (place === undefined || !places.has(place)) return false;
          }
          if (hullRestrictions && !canFit(type)) return false;
          if (flyable && missingSkills([type.id]).length > 0) return false;
          return type.name.toLowerCase().includes(query);
        }
      : undefined;
  const tree = useModuleTree(query === "" ? keep : undefined);
  const found = useModuleSearch(query === "" ? undefined : keep);
  const groups = query === "" ? tree : found;
  const only = query !== "" && groups.length === 1 ? groups[0] : undefined;

  const open = query !== "" && query !== collapsed.query && countTypes(groups) <= MOST_OPENED_BY_SEARCH;

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
        {groups.length === 0 ? (
          <p className={styles.empty}>No modules found</p>
        ) : (
          <TreeList key={`${collapsed.times}-${open}`} label="Modules">
            {only !== undefined ? (
              <TypeLeaves sorted={only} open={open} actions={actions} />
            ) : (
              groups.map((node) => <ModuleGroup key={node.group.id} node={node} open={open} actions={actions} />)
            )}
          </TreeList>
        )}
      </div>
      {dragImage}
    </>
  );
}

interface ModuleGroupProps {
  node: ModuleGroupNode;
  open: boolean;
  actions: TypeActions;
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
          <TypeLeaves sorted={node} open={open} actions={actions} />
        </>
      )}
    </TreeGroup>
  );
}

function countTypes(nodes: readonly ModuleGroupNode[]): number {
  return nodes.reduce((count, node) => count + countTypes(node.children) + countLeaves(node), 0);
}
