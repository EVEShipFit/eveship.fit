import { useHullTree } from "@eveshipfit/react-hooks";
import { useState } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";

/** The Hulls & Fits tab of the `ItemBrowser`: EVE's hulls by group and race. */
export function HullsAndFits() {
  const [search, setSearch] = useState("");
  // A new key mounts the tree again, with every group open or closed.
  const [tree, setTree] = useState({ key: 0, open: false });

  const query = search.trim().toLowerCase();
  const groups = useHullTree(query === "" ? undefined : (ship) => ship.name.toLowerCase().includes(query));

  const onSearch = (value: string) => {
    const searching = value.trim() !== "";
    if (searching !== (query !== "")) setTree({ key: tree.key + 1, open: searching });
    setSearch(value);
  };

  return (
    <>
      <div className={styles.search}>
        <Tooltip label="Collapse All Groups">
          <button
            type="button"
            className={styles.collapse}
            aria-label="Collapse All Groups"
            onClick={() => setTree({ key: tree.key + 1, open: false })}
          >
            <Icon name="collapse" />
          </button>
        </Tooltip>
        <label className={styles.field}>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.tree}>
        <TreeList key={tree.key} label="Hulls">
          {groups.map(({ group, races }) => (
            <TreeGroup key={group.id} label={group.name} defaultOpen={tree.open}>
              {() =>
                races.map(({ race, ships }) => (
                  <TreeGroup key={race} label={`${raceName(race)} [${ships.length}]`} defaultOpen={tree.open}>
                    {() =>
                      ships.map((ship) => (
                        <TreeLeaf
                          key={ship.id}
                          label={<span className={styles.hull}>{ship.name}</span>}
                          typeId={ship.id}
                        />
                      ))
                    }
                  </TreeGroup>
                ))
              }
            </TreeGroup>
          ))}
        </TreeList>
      </div>
    </>
  );
}

function raceName(race: string): string {
  return race === "other" ? "Non-Empire" : race.charAt(0).toUpperCase() + race.slice(1);
}
