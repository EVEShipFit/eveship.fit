import type { Fit } from "@eveshipfit/fitting";
import {
  useDrag,
  useFit,
  useFitStore,
  useHullTree,
  useImages,
  useLocalFits,
  useMissingSkills,
} from "@eveshipfit/react-hooks";
import { useState, type CSSProperties } from "react";

import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { Icon, useIconUrl, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf, TreeList } from "../../primitives/TreeList/TreeList";
import styles from "./ItemBrowser.module.css";
import { Search } from "./Search";

const noFits: readonly Fit[] = [];
const SHIPS_MARKET_GROUP_ID = 4;

/** The Hulls & Fits tab of the `ItemBrowser`: EVE's hulls by group and race, with the fits saved for each. */
export function HullsAndFits() {
  const currentShipId = useFit().ship.type_id;
  const images = useImages();
  const store = useFitStore();
  const missingSkills = useMissingSkills();
  const { fits } = useLocalFits();
  const { start, end } = useDrag();
  const [search, setSearch] = useState("");
  const [browserFits, setBrowserFits] = useState(false);
  const [currentHull, setCurrentHull] = useState(false);
  const [flyable, setFlyable] = useState(false);
  const [collapses, setCollapses] = useState(0);

  const query = search.trim().toLowerCase();
  const matches = (name: string | undefined) => (name ?? "").toLowerCase().includes(query);

  const fitsByHull = Map.groupBy(fits, (saved) => saved.ship.type_id);
  const shownFits = (ship: { id: number; name: string }) => {
    const saved = fitsByHull.get(ship.id) ?? noFits;
    const kept = flyable ? saved.filter((one) => missingSkills(one).length === 0) : saved;
    return matches(ship.name) ? kept : kept.filter((one) => matches(one.name));
  };

  const groups = useHullTree(
    query !== "" || currentHull || browserFits || flyable
      ? (ship) => {
          if (currentHull && ship.id !== currentShipId) return false;
          if (flyable && missingSkills([ship.id]).length > 0) return false;
          const shown = shownFits(ship);
          if (browserFits && shown.length === 0) return false;
          return matches(ship.name) || shown.length > 0;
        }
      : undefined,
  );

  const simulate = (shipTypeId: number) => store.replace({ ship: { type_id: shipTypeId }, items: [] });

  return (
    <>
      <Search value={search} onChange={setSearch} onCollapse={() => setCollapses(collapses + 1)} />
      <fieldset className={styles.filters} aria-label="Filters">
        <FilterToggle
          icon="fits-browser"
          label="Browser Fittings"
          pressed={browserFits}
          onPressedChange={setBrowserFits}
        />
        <FilterToggle icon="fits-personal" label="Personal Fittings" />
        <FilterToggle icon="fits-corporation" label="Corporation Fittings" />
        <FilterToggle icon="fits-alliance" label="Alliance Fittings" />
        <FilterToggle icon="fits-community" label="Community Fittings" />
        <FilterToggle icon="current-hull" label="Current Hull" pressed={currentHull} onPressedChange={setCurrentHull} />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
      </fieldset>
      <div className={styles.tree}>
        <TreeList key={collapses} label="Hulls">
          {groups.map(({ group, races }) => (
            <TreeGroup key={group.id} label={group.name}>
              {() =>
                races.map(({ race, factionId, ships }) => (
                  <TreeGroup
                    key={race}
                    label={`${raceName(race)} [${ships.length}]`}
                    icon={
                      factionId === undefined
                        ? images.marketGroupIcon(SHIPS_MARKET_GROUP_ID)
                        : images.factionIcon(factionId)
                    }
                  >
                    {() =>
                      ships.map((ship) => {
                        const shown = shownFits(ship);
                        const simulateShip = (
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
                        );

                        return (
                          <TreeGroup
                            key={ship.id}
                            label={<span className={styles.hull}>{ship.name}</span>}
                            description={
                              shown.length > 0 ? (
                                <Counts browserFits={fitsByHull.get(ship.id)?.length ?? 0} />
                              ) : undefined
                            }
                            typeId={ship.id}
                            after={simulateShip}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "copy";
                              event.dataTransfer.setData("text/plain", ship.name);
                              start({ type: "hull", typeId: ship.id });
                            }}
                            onDragEnd={end}
                          >
                            {() =>
                              shown.length === 0 ? (
                                <TreeLeaf label="No Item" />
                              ) : (
                                shown.map((saved) => (
                                  <TreeLeaf
                                    key={saved.name ?? ""}
                                    label={
                                      <>
                                        <span className={styles.kind}>
                                          <Icon name="fits-browser" />
                                        </span>
                                        {saved.name || ship.name}
                                      </>
                                    }
                                    onActivate={() => store.replace(saved)}
                                    after={<Flyable fit={saved} />}
                                  />
                                ))
                              )
                            }
                          </TreeGroup>
                        );
                      })
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

function Counts({ browserFits }: { browserFits: number }) {
  return (
    <span className={styles.counts}>
      <Count icon="fits-browser" label="Browser Fittings" count={browserFits} />
      <Count icon="fits-corporation" label="Corporation Fittings" count={0} />
      <Count icon="fits-community-small" label="Community Fittings" count={0} />
      <Count icon="fits-alliance-small" label="Alliance Fittings" count={0} />
    </span>
  );
}

function Count({ icon, label, count }: { icon: IconName; label: string; count: number }) {
  return (
    <span className={styles.count}>
      <Icon name={icon} />
      <span className={styles.unseen}>{label}: </span>
      {count}
    </span>
  );
}

function Flyable({ fit }: { fit: Fit }) {
  const missing = useMissingSkills()(fit).length;
  const texture = useIconUrl(missing === 0 ? "checkmark" : "close");
  const label = missing === 0 ? "Can fly" : `Missing skills: ${missing}`;

  return (
    <Tooltip label={label}>
      <span
        className={styles.flyable}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- An <img> cannot be tinted.
        role="img"
        aria-label={label}
        data-missing={missing > 0 || undefined}
        style={{ "--texture": `url(${texture})` } as CSSProperties}
      />
    </Tooltip>
  );
}

function raceName(race: string): string {
  return race === "other" ? "Non-Empire" : race.charAt(0).toUpperCase() + race.slice(1);
}
