import { useChargedModules, useCharges, useChargeTree, useImages, useSde } from "@eveshipfit/react-hooks";
import type { MarketGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { useMemo, useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { TreeGroup, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { MOST_OPENED_BY_SEARCH, Search } from "./Search";
import { countLeaves, TypeLeaf, TypeLeaves, useTypeActions, type TypeActions } from "./TypeLeaf";

/** The Charges tab of the `ItemBrowser`: every charge by market group, or only those a fitted module loads. */
export function Charges() {
  const sde = useSde();
  const { actions, clear, dragImage } = useTypeActions();
  const modules = useChargedModules();
  const [picked, setPicked] = useState<number>();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<{ times: number; query?: string }>({ times: 0 });

  const selected = modules.some((module) => module.id === picked) ? picked : undefined;

  const query = search.trim().toLowerCase();
  const matches = useMemo(
    () =>
      selected === undefined && query !== "" ? (type: SdeType) => type.name.toLowerCase().includes(query) : undefined,
    [selected, query],
  );
  const groups = useChargeTree(matches);
  const charges = useCharges(selected);
  const loadable = useMemo(
    () => sde.sortByMeta(charges.filter((type) => type.name.toLowerCase().includes(query))),
    [sde, charges, query],
  );

  const count = selected === undefined ? countTypes(groups) : countLeaves(loadable);
  const open = query !== "" && query !== collapsed.query && count <= MOST_OPENED_BY_SEARCH;

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
        {modules.map((module) => (
          <FilterToggle
            key={module.id}
            typeId={module.id}
            label={module.name}
            pressed={selected === module.id}
            onPressedChange={(pressed) => setPicked(pressed ? module.id : undefined)}
          />
        ))}
      </fieldset>
      <div className={styles.tree}>
        <TreeList key={`${collapsed.times}-${open}-${selected}`} label="Charges">
          {selected === undefined ? (
            groups.map((node) => <ChargeGroup key={node.group.id} node={node} open={open} actions={actions} />)
          ) : (
            <TypeLeaves sorted={loadable} open={open} actions={actions} icon />
          )}
        </TreeList>
      </div>
      {dragImage}
    </>
  );
}

interface ChargeGroupProps {
  node: MarketGroupNode;
  open: boolean;
  actions: TypeActions;
}

function ChargeGroup({ node, open, actions }: ChargeGroupProps) {
  const images = useImages();

  return (
    <TreeGroup label={node.group.name} icon={images.marketGroupIcon(node.group.id)} defaultOpen={open}>
      {() => (
        <>
          {node.children.map((child) => (
            <ChargeGroup key={child.group.id} node={child} open={open} actions={actions} />
          ))}
          {node.types.map((type) => (
            <TypeLeaf key={type.id} type={type} actions={actions} />
          ))}
        </>
      )}
    </TreeGroup>
  );
}

function countTypes(nodes: readonly MarketGroupNode[]): number {
  return nodes.reduce((count, node) => count + countTypes(node.children) + node.types.length, 0);
}
