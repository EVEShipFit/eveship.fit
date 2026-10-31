import type { Placement } from "@eveshipfit/fitting";
import {
  useBrowse,
  useCanFit,
  useMissingSkills,
  useModuleSearch,
  useModuleTree,
  usePlacement,
  useSnapshot,
} from "@eveshipfit/react-hooks";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo, useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import type { IconName } from "../../primitives/Icon/Icon";
import { TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";
import { SearchResults, TypeGroup, useTypeActions } from "./TypeLeaf";

type SlotFilter = "low" | "medium" | "high" | "rig" | "service" | "drones";
type Place = Placement["type"];

const slotFilters: { filter: SlotFilter; icon: IconName; label: string; places: readonly Place[] }[] = [
  { filter: "low", icon: "filter-low-slot", label: "Low Slot", places: ["low"] },
  { filter: "medium", icon: "filter-medium-slot", label: "Mid Slot", places: ["medium"] },
  { filter: "high", icon: "filter-high-slot", label: "High Slot", places: ["high"] },
  { filter: "rig", icon: "filter-rig-slot", label: "Rig & Subsystem Slots", places: ["rig", "subsystem"] },
  { filter: "service", icon: "slot-service", label: "Service Slot", places: ["service"] },
  { filter: "drones", icon: "filter-drones", label: "Drones", places: ["drone_bay", "fighter_bay"] },
];

/** The Modules tab of the `ItemBrowser`: what goes on a ship, by market group. */
export function Modules({ noHullSelected }: { noHullSelected: boolean }) {
  const { actions, clear, overlays } = useTypeActions(noHullSelected);
  const placement = usePlacement();
  const canFit = useCanFit();
  const missingSkills = useMissingSkills();
  const services = useSnapshot().stats.slots.service.total > 0;
  const shownFilters = slotFilters.filter(({ filter }) => services || filter !== "service");
  const [search, setSearch] = useState("");
  const [slots, setSlots] = useState<ReadonlySet<SlotFilter>>(() => new Set());
  const [hullRestrictions, setHullRestrictions] = useState(false);
  const [flyable, setFlyable] = useState(false);
  const [collapses, setCollapses] = useState(0);
  const { request } = useBrowse();
  const [browsed, setBrowsed] = useState(request);
  if (request !== browsed) {
    setBrowsed(request);
    const target = request?.target;
    const filter =
      typeof target === "string" ? slotFilters.find(({ places }) => places.includes(target))?.filter : undefined;
    if (filter !== undefined) {
      setSlots(new Set([filter]));
      setHullRestrictions(true);
    }
  }

  const query = search.trim().toLowerCase();
  const keep = useMemo(() => {
    const places = new Set(
      slotFilters
        .filter(({ filter }) => slots.has(filter) && (services || filter !== "service"))
        .flatMap((slot) => slot.places),
    );
    if (query === "" && places.size === 0 && !hullRestrictions && !flyable) return undefined;
    return (type: SdeType) => {
      if (places.size > 0) {
        const place = placement(type)?.type;
        if (place === undefined || !places.has(place)) return false;
      }
      if (hullRestrictions && !noHullSelected && !canFit(type)) return false;
      if (flyable && missingSkills([type.id]).length > 0) return false;
      return type.name.toLowerCase().includes(query);
    };
  }, [query, slots, services, hullRestrictions, noHullSelected, flyable, placement, canFit, missingSkills]);
  const tree = useModuleTree(query === "" ? keep : undefined);
  const found = useModuleSearch(query === "" ? undefined : keep);
  const groups = query === "" ? tree : found;

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
        onCollapse={() => setCollapses(collapses + 1)}
      />
      <fieldset className={styles.filters} aria-label="Filters">
        {shownFilters.map(({ filter, icon, label }) => (
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
          disabled={noHullSelected}
          onPressedChange={setHullRestrictions}
        />
        <FilterToggle icon="filter-resources" label="Resources" />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
      </fieldset>
      <div className={styles.tree}>
        {groups.length === 0 ? (
          <p className={styles.empty}>No modules found</p>
        ) : (
          <TreeList key={collapses} label="Modules">
            {query === "" ? (
              groups.map((node) => <TypeGroup key={node.group.id} node={node} actions={actions} />)
            ) : (
              <SearchResults roots={groups} actions={actions} />
            )}
          </TreeList>
        )}
      </div>
      {overlays}
    </>
  );
}
