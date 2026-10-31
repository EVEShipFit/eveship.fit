import type { Placement } from "@eveshipfit/fitting";
import { useBrowse, useImplantSearch, useImplantTree, useMissingSkills, usePlacement } from "@eveshipfit/react-hooks";
import type { MarketGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { useEffect, useRef, useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeList } from "../../primitives/TreeList/TreeList";
import type { Augmentation } from "../../primitives/Wheel/layout";
import { useAugmentationIcon } from "../../primitives/Wheel/WheelAugmentationTrack";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";
import { MarketGroup, SearchResults, TypeLeaf, useTypeActions, type TypeActions } from "./TypeLeaf";

type View = "market" | "slot";

const views: { view: View; icon: IconName; label: string }[] = [
  { view: "market", icon: "folder", label: "By Market Group" },
  { view: "slot", icon: "number", label: "By Slot" },
];

const kindLabels: Record<Augmentation, string> = { implant: "Implant", booster: "Booster" };

interface Opened {
  kind: Augmentation;
  index?: number;
}

interface SlotTypes {
  kind: Augmentation;
  index: number;
  types: SdeType[];
}

/** The Implants tab of the `ItemBrowser`: implants and boosters by market group or by slot. */
export function Implants() {
  const { actions, clear, dragImage } = useTypeActions();
  const placement = usePlacement();
  const missingSkills = useMissingSkills();
  const [search, setSearch] = useState("");
  const [kinds, setKinds] = useState<ReadonlySet<Augmentation>>(() => new Set());
  const [flyable, setFlyable] = useState(false);
  const [view, setView] = useState<View>("market");
  const [collapses, setCollapses] = useState(0);
  const [opened, setOpened] = useState<Opened>();
  const { request } = useBrowse();
  const [browsed, setBrowsed] = useState(request);
  if (request !== browsed) {
    setBrowsed(request);
    const target = request?.target;
    if (target !== undefined && typeof target !== "string") {
      setKinds(new Set([target.type]));
      setView("slot");
      setOpened({ kind: target.type, index: target.index });
      setCollapses(collapses + 1);
    }
  }

  const query = search.trim().toLowerCase();
  const keep =
    query !== "" || kinds.size > 0 || flyable
      ? (type: SdeType) => {
          if (kinds.size > 0) {
            const place = placement(type)?.type;
            if (place !== "implant" && place !== "booster") return false;
            if (!kinds.has(place)) return false;
          }
          if (flyable && missingSkills([type.id]).length > 0) return false;
          return type.name.toLowerCase().includes(query);
        }
      : undefined;
  const tree = useImplantTree(view === "slot" || query === "" ? keep : undefined);
  const found = useImplantSearch(view === "market" && query !== "" ? keep : undefined);
  const slots = view === "slot" ? slotGroups(tree, placement) : [];
  const empty = view === "slot" ? slots.length === 0 : query === "" ? tree.length === 0 : found.length === 0;

  const treeRef = useRef<HTMLDivElement>(null);
  const scrolledTo = useRef(opened);
  useEffect(() => {
    if (scrolledTo.current === opened) return;
    scrolledTo.current = opened;
    treeRef.current?.querySelector("[aria-expanded=true]")?.scrollIntoView({ block: "start" });
  }, [opened]);

  const toggleKind = (kind: Augmentation, pressed: boolean) => {
    const next = new Set(kinds);
    if (pressed) next.add(kind);
    else next.delete(kind);
    setKinds(next);
  };

  return (
    <>
      <Search
        value={search}
        onChange={(value) => {
          clear();
          setSearch(value);
        }}
        onCollapse={() => {
          setOpened(undefined);
          setCollapses(collapses + 1);
        }}
        after={
          <fieldset className={styles.views} aria-label="View">
            {views.map((each) => (
              <Tooltip key={each.view} label={each.label}>
                <button
                  type="button"
                  className={styles.collapse}
                  aria-label={each.label}
                  aria-pressed={view === each.view}
                  onClick={() => {
                    setOpened(undefined);
                    setView(each.view);
                  }}
                >
                  <Icon name={each.icon} />
                </button>
              </Tooltip>
            ))}
          </fieldset>
        }
      />
      <fieldset className={styles.filters} aria-label="Filters">
        <KindToggle kind="implant" pressed={kinds.has("implant")} onPressedChange={toggleKind} />
        <KindToggle kind="booster" pressed={kinds.has("booster")} onPressedChange={toggleKind} />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
      </fieldset>
      <div ref={treeRef} className={styles.tree}>
        {empty ? (
          <p className={styles.empty}>No implants found</p>
        ) : (
          <TreeList key={`${collapses}-${view}`} label="Implants">
            {view === "slot" ? (
              <SlotGroups slots={slots} opened={opened} searching={query !== ""} actions={actions} />
            ) : query !== "" ? (
              <SearchResults roots={found} actions={actions} />
            ) : (
              tree.map((node) => <MarketGroup key={node.group.id} node={node} actions={actions} />)
            )}
          </TreeList>
        )}
      </div>
      {dragImage}
    </>
  );
}

function KindToggle({
  kind,
  pressed,
  onPressedChange,
}: {
  kind: Augmentation;
  pressed: boolean;
  onPressedChange: (kind: Augmentation, pressed: boolean) => void;
}) {
  const icon = useAugmentationIcon(kind);
  return (
    <FilterToggle
      src={icon}
      label={kind === "implant" ? "Implants" : "Boosters"}
      pressed={pressed}
      onPressedChange={(next) => onPressedChange(kind, next)}
    />
  );
}

/** The slots; a lone slot found by a search shows only its types. */
function SlotGroups({
  slots,
  opened,
  searching,
  actions,
}: {
  slots: readonly SlotTypes[];
  opened: Opened | undefined;
  searching: boolean;
  actions: TypeActions;
}) {
  const [only] = slots;
  if (searching && slots.length === 1 && only !== undefined) {
    return only.types.map((type) => <TypeLeaf key={type.id} type={type} actions={actions} />);
  }
  return slots.map((slot) => (
    <SlotGroup
      key={`${slot.kind}-${slot.index}`}
      slot={slot}
      open={opened?.kind === slot.kind && opened.index === slot.index}
      actions={actions}
    />
  ));
}

function SlotGroup({ slot, open, actions }: { slot: SlotTypes; open: boolean; actions: TypeActions }) {
  return (
    <TreeGroup label={`${kindLabels[slot.kind]} Slot ${slot.index}`} defaultOpen={open}>
      {() => slot.types.map((type) => <TypeLeaf key={type.id} type={type} actions={actions} />)}
    </TreeGroup>
  );
}

/** The types of `tree` by slot: implants, then boosters, each by slot number. */
function slotGroups(
  tree: readonly MarketGroupNode[],
  placement: (type: SdeType) => Placement | undefined,
): readonly SlotTypes[] {
  const groups = new Map<string, SlotTypes>();
  const visit = (node: MarketGroupNode) => {
    node.children.forEach(visit);
    for (const type of node.types) {
      const place = placement(type);
      if (place?.type !== "implant" && place?.type !== "booster") continue;
      const key = `${place.type}-${place.index}`;
      let group = groups.get(key);
      if (group === undefined) groups.set(key, (group = { kind: place.type, index: place.index, types: [] }));
      group.types.push(type);
    }
  };
  tree.forEach(visit);
  return [...groups.values()].toSorted(
    (a, b) => Number(a.kind === "booster") - Number(b.kind === "booster") || a.index - b.index,
  );
}
