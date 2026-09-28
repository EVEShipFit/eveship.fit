import { useChargedModules, useCharges, useChargeSearch, useChargeTree, useSde } from "@eveshipfit/react-hooks";
import type { MarketGroupNode, SdeType } from "@eveshipfit/sde-loader";
import { useMemo, useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { TreeGroup, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";
import {
  countLeaves,
  SearchResults,
  TypeLeaf,
  TypeLeaves,
  useMarketGroupIcon,
  useTypeActions,
  type TypeActions,
} from "./TypeLeaf";

/** The Charges tab of the `ItemBrowser`: every charge by market group, or only those a fitted module loads. */
export function Charges() {
  const sde = useSde();
  const { actions, clear, dragImage } = useTypeActions();
  const modules = useChargedModules();
  const [picked, setPicked] = useState<number>();
  const [search, setSearch] = useState("");
  const [collapses, setCollapses] = useState(0);

  const selected = modules.some((module) => module.id === picked) ? picked : undefined;

  const query = search.trim().toLowerCase();
  const matches = useMemo(
    () =>
      selected === undefined && query !== "" ? (type: SdeType) => type.name.toLowerCase().includes(query) : undefined,
    [selected, query],
  );
  const groups = useChargeTree();
  const found = useChargeSearch(matches);
  const charges = useCharges(selected);
  const loadable = useMemo(
    () => sde.sortByMeta(charges.filter((type) => type.name.toLowerCase().includes(query))),
    [sde, charges, query],
  );

  const empty = selected === undefined ? matches !== undefined && found.length === 0 : countLeaves(loadable) === 0;

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
        {empty ? (
          <p className={styles.empty}>No charges found</p>
        ) : (
          <TreeList key={`${collapses}-${selected}`} label="Charges">
            {selected !== undefined ? (
              <TypeLeaves sorted={loadable} actions={actions} icon />
            ) : matches !== undefined ? (
              <SearchResults roots={found} actions={actions} />
            ) : (
              groups.map((node) => <ChargeGroup key={node.group.id} node={node} actions={actions} />)
            )}
          </TreeList>
        )}
      </div>
      {dragImage}
    </>
  );
}

interface ChargeGroupProps {
  node: MarketGroupNode;
  actions: TypeActions;
}

function ChargeGroup({ node, actions }: ChargeGroupProps) {
  const marketGroupIcon = useMarketGroupIcon();

  return (
    <TreeGroup label={node.group.name} icon={marketGroupIcon(node.group.id)}>
      {() => (
        <>
          {node.children.map((child) => (
            <ChargeGroup key={child.group.id} node={child} actions={actions} />
          ))}
          {node.types.map((type) => (
            <TypeLeaf key={type.id} type={type} actions={actions} />
          ))}
        </>
      )}
    </TreeGroup>
  );
}
