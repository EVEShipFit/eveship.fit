import type { Fit } from "@eveshipfit/fitting";
import {
  useDrag,
  useFit,
  useFitStore,
  useHullTree,
  useImages,
  useLocalFits,
  useMissingSkills,
  usePersonalFits,
  useShowInfo,
} from "@eveshipfit/react-hooks";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";

import { useContextMenu } from "../../primitives/ContextMenu/ContextMenu";
import { Dialog } from "../../primitives/Dialog/Dialog";
import { FilterToggle } from "../../primitives/FilterToggle/FilterToggle";
import { Icon, useIconUrl, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf, TreeList } from "../../primitives/TreeList/TreeList";
import { ShipBonuses } from "../ShipBonuses/ShipBonuses";
import styles from "./ItemBrowser.module.css";
import { useCopyFit } from "./copyFit";
import { Search } from "./Search";

interface Listed {
  fit: Fit;
  kind: "fits-browser" | "fits-personal";
}

const noFits: readonly Listed[] = [];
const SHIPS_MARKET_GROUP_ID = 4;

/** The Hulls & Fits tab of the `ItemBrowser`: EVE's hulls by group and race, with the fits saved for each. */
export function HullsAndFits({ noHullSelected }: { noHullSelected: boolean }) {
  const fitShipId = useFit().ship.type_id;
  const images = useImages();
  const store = useFitStore();
  const missingSkills = useMissingSkills();
  const { fits, remove } = useLocalFits();
  const { show: showInfo } = useShowInfo();
  const { open, menu } = useContextMenu();
  const { copy, dialog: copyDialog } = useCopyFit();
  const [deleting, setDeleting] = useState<Fit>();
  const personal = usePersonalFits();
  const { start, end } = useDrag();
  const [search, setSearch] = useState("");
  const [browserFits, setBrowserFits] = useState(false);
  const [personalFits, setPersonalFits] = useState(false);
  const [currentHull, setCurrentHull] = useState(false);
  const [flyable, setFlyable] = useState(false);
  const [collapses, setCollapses] = useState(0);

  const query = search.trim().toLowerCase();
  const anySource = browserFits || personalFits;
  const currentShipId = currentHull && !noHullSelected ? fitShipId : undefined;

  const { browserByHull, personalByHull, shownFits } = useMemo(() => {
    const matches = (name: string | undefined) => (name ?? "").toLowerCase().includes(query);
    const listed: Listed[] = [
      ...(!anySource || browserFits ? fits.map((fit) => ({ fit, kind: "fits-browser" as const })) : []),
      ...(!anySource || personalFits ? personal.fits.map((fit) => ({ fit, kind: "fits-personal" as const })) : []),
    ].toSorted((a, b) => (a.fit.name ?? "").localeCompare(b.fit.name ?? ""));
    const fitsByHull = Map.groupBy(listed, ({ fit }) => fit.ship.type_id);
    return {
      browserByHull: Map.groupBy(fits, (fit) => fit.ship.type_id),
      personalByHull: Map.groupBy(personal.fits, (fit) => fit.ship.type_id),
      shownFits: (ship: { id: number; name: string }) => {
        const saved = fitsByHull.get(ship.id) ?? noFits;
        const kept = flyable ? saved.filter(({ fit }) => missingSkills(fit).length === 0) : saved;
        return matches(ship.name) ? kept : kept.filter(({ fit }) => matches(fit.name));
      },
    };
  }, [query, anySource, browserFits, personalFits, fits, personal.fits, flyable, missingSkills]);

  const keep = useMemo(() => {
    if (query === "" && !currentHull && !anySource && !flyable) return undefined;
    return (ship: SdeType) => {
      if (currentShipId !== undefined && ship.id !== currentShipId) return false;
      if (flyable && missingSkills([ship.id]).length > 0) return false;
      const shown = shownFits(ship);
      if (anySource && shown.length === 0 && !currentHull) return false;
      return ship.name.toLowerCase().includes(query) || shown.length > 0;
    };
  }, [query, currentHull, anySource, flyable, currentShipId, missingSkills, shownFits]);
  const groups = useHullTree(keep);

  const simulate = (shipTypeId: number) => store.replace({ ship: { type_id: shipTypeId }, items: [] });

  const hullMenu = (event: MouseEvent<HTMLElement>, ship: SdeType) => {
    const anchor = event.currentTarget;
    open(event, [
      {
        label: "Show Info",
        icon: "module-info",
        onSelect: () => showInfo({ typeId: ship.id }, { element: anchor, side: "right" }),
      },
      "separator",
      { label: "Simulate Ship", onSelect: () => simulate(ship.id) },
    ]);
  };

  const fitMenu = (event: MouseEvent<HTMLElement>, { fit, kind }: Listed) => {
    open(event, [
      { label: "Simulate Fitting", onSelect: () => store.replace(fit) },
      "separator",
      { label: "Copy as EFT", onSelect: () => copy(fit, "eft") },
      { label: "Copy as esf/1", onSelect: () => copy(fit, "esf") },
      "separator",
      kind === "fits-browser" && { label: "Delete Fitting", onSelect: () => setDeleting(fit) },
    ]);
  };

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
        <FilterToggle
          icon="fits-personal"
          label="Personal Fittings"
          pressed={personalFits}
          onPressedChange={setPersonalFits}
        />
        <FilterToggle icon="fits-corporation" label="Corporation Fittings" />
        <FilterToggle icon="fits-alliance" label="Alliance Fittings" />
        <FilterToggle icon="fits-community" label="Community Fittings" />
        <FilterToggle
          icon="current-hull"
          label="Current Hull"
          pressed={currentHull}
          disabled={noHullSelected}
          onPressedChange={setCurrentHull}
        />
        <FilterToggle icon="skills" label="Skills" pressed={flyable} onPressedChange={setFlyable} />
      </fieldset>
      <div className={styles.tree}>
        {personalFits && personal.character?.canReadFits !== true ? (
          <p className={styles.empty}>
            {personal.character === undefined
              ? "Log in or pick a character with the Character button"
              : "Log in again with the Character button to see fittings"}
          </p>
        ) : groups.length === 0 ? (
          <p className={styles.empty}>No hulls found</p>
        ) : null}
        {groups.length > 0 && (
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
                                  <Counts
                                    browserFits={browserByHull.get(ship.id)?.length ?? 0}
                                    personalFits={personalByHull.get(ship.id)?.length ?? 0}
                                  />
                                ) : undefined
                              }
                              typeId={ship.id}
                              renderIconTooltip={() => <ShipBonuses typeId={ship.id} />}
                              after={simulateShip}
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "copy";
                                event.dataTransfer.setData("text/plain", ship.name);
                                start({ type: "hull", typeId: ship.id });
                              }}
                              onDragEnd={end}
                              onContextMenu={(event) => hullMenu(event, ship)}
                            >
                              {() =>
                                shown.length === 0 ? (
                                  <TreeLeaf label="No Item" />
                                ) : (
                                  shown.map((listed, index) => {
                                    const { fit, kind } = listed;
                                    return (
                                      <TreeLeaf
                                        key={`${kind}:${fit.name ?? ""}:${index}`}
                                        label={
                                          <>
                                            <span className={styles.kind}>
                                              <Icon name={kind} />
                                            </span>
                                            {fit.name || ship.name}
                                          </>
                                        }
                                        onActivate={() => store.replace(fit)}
                                        onContextMenu={(event) => fitMenu(event, listed)}
                                        activateOnClick
                                        after={<Flyable fit={fit} />}
                                      />
                                    );
                                  })
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
        )}
      </div>
      {menu}
      {copyDialog}
      <Dialog open={deleting !== undefined} title="Delete Fitting?" onClose={() => setDeleting(undefined)}>
        <div className={styles.confirm}>
          <p>Delete the fit &quot;{deleting?.name || "Unnamed"}&quot; from this browser?</p>
          <div className={styles.dialogButtons}>
            <button type="button" className={styles.action} onClick={() => setDeleting(undefined)}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                if (deleting) remove(deleting);
                setDeleting(undefined);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function Counts({ browserFits, personalFits }: { browserFits: number; personalFits: number }) {
  return (
    <span className={styles.counts}>
      <Count icon="fits-browser" label="Browser Fittings" count={browserFits} />
      <Count icon="fits-personal" label="Personal Fittings" count={personalFits} />
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
