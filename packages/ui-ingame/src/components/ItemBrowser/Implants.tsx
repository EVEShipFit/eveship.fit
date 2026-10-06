import { useImplantSearch, useImplantTree } from "@eveshipfit/react-hooks";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo, useState } from "react";

import { TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";
import { MarketGroup, SearchResults, useTypeActions } from "./TypeLeaf";

/** The Implants tab of the `ItemBrowser`: implants and boosters by market group. */
export function Implants() {
  const { actions, clear, dragImage } = useTypeActions();
  const [search, setSearch] = useState("");
  const [collapses, setCollapses] = useState(0);

  const query = search.trim().toLowerCase();
  const matches = useMemo(
    () => (query === "" ? undefined : (type: SdeType) => type.name.toLowerCase().includes(query)),
    [query],
  );
  const groups = useImplantTree();
  const found = useImplantSearch(matches);

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
      <div className={styles.tree}>
        {matches !== undefined && found.length === 0 ? (
          <p className={styles.empty}>No implants found</p>
        ) : (
          <TreeList key={collapses} label="Implants">
            {matches !== undefined ? (
              <SearchResults roots={found} actions={actions} />
            ) : (
              groups.map((node) => <MarketGroup key={node.group.id} node={node} actions={actions} />)
            )}
          </TreeList>
        )}
      </div>
      {dragImage}
    </>
  );
}
