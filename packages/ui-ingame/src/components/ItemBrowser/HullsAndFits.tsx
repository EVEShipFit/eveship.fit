import { useFit, useFitStore, useHullTree, useMissingSkills } from "@eveshipfit/react-hooks";
import { useState } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";

/** The Hulls & Fits tab of the `ItemBrowser`: EVE's hulls by group and race. */
export function HullsAndFits() {
  const fit = useFit();
  const store = useFitStore();
  const missingSkills = useMissingSkills();
  const [search, setSearch] = useState("");
  const [currentHull, setCurrentHull] = useState(false);
  const [flyable, setFlyable] = useState(false);
  // A new key mounts the tree again, with every group open or closed.
  const [tree, setTree] = useState({ key: 0, open: false });

  const query = search.trim().toLowerCase();
  const narrowed = query !== "" || currentHull;
  const groups = useHullTree(
    narrowed || flyable
      ? (ship) =>
          ship.name.toLowerCase().includes(query) &&
          (!currentHull || ship.id === fit.ship.type_id) &&
          (!flyable || missingSkills([ship.id]).length === 0)
      : undefined,
  );

  const narrow = (nextSearch: string, nextCurrentHull: boolean) => {
    const nextNarrowed = nextSearch.trim() !== "" || nextCurrentHull;
    if (nextNarrowed !== narrowed) setTree({ key: tree.key + 1, open: nextNarrowed });
    setSearch(nextSearch);
    setCurrentHull(nextCurrentHull);
  };

  const simulate = (shipTypeId: number) => store.replace({ ship: { type_id: shipTypeId }, items: [] });

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
            onChange={(event) => narrow(event.target.value, currentHull)}
          />
        </label>
      </div>
      <div className={styles.filters}>
        <FilterToggle icon="fits-personal" label="Personal Fittings" />
        <FilterToggle icon="fits-corporation" label="Corporation Fittings" />
        <FilterToggle icon="fits-alliance" label="Alliance Fittings" />
        <FilterToggle icon="fits-community" label="Community Fittings" />
        <FilterToggle
          icon="current-hull"
          label="Current Hull"
          pressed={currentHull}
          onPressedChange={(pressed) => narrow(search, pressed)}
        />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
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
                          onActivate={() => simulate(ship.id)}
                          after={
                            <Tooltip label="Simulate Ship">
                              <button
                                type="button"
                                className={styles.simulate}
                                aria-label={`Simulate ${ship.name}`}
                                onClick={() => simulate(ship.id)}
                              >
                                <Icon name="simulate" />
                              </button>
                            </Tooltip>
                          }
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
