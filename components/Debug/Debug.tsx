"use client";

import React from "react";

import styles from "./Debug.module.css";
import { CalculationDetail, EveDataContext, ShipSnapshotContext } from "@eveshipfit/react";

declare global {
  interface Window {
    esf_debug: () => void;
  }
}

export const Debug = () => {
  const [showDebug, setShowDebug] = React.useState(false);
  const eveData = React.useContext(EveDataContext);
  const snapshot = React.useContext(ShipSnapshotContext);

  React.useEffect(() => {
    window.esf_debug = () => setShowDebug((prev) => !prev);
  }, []);

  const [tab, setTab] = React.useState<
    "JSON" | "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number }
  >("Ship");

  const items =
    snapshot?.items
      ?.map((item, index) => {
        return { item, index };
      })
      .sort((a, b) => a.item.flag - b.item.flag) ?? [];

  if (!showDebug) return <></>;

  return (
    <>
      <div className={styles.debug}>
        <div className={styles.header}>EVEShip.fit debugger</div>

        <select value={JSON.stringify(tab)} onChange={(e) => setTab(JSON.parse(e.target.value))}>
          <option value='"JSON"'>JSON</option>
          <option value='"Ship"'>Ship</option>
          <option value='"Char"'>Character</option>
          {items.map(({ item, index }) => (
            <React.Fragment key={index}>
              <option value={`{"Item":${index}}`}>
                {item.flag} - {eveData.typeIDs?.[item.type_id]?.name}
              </option>
              {item.charge && (
                <option value={`{"Charge":${index}}`}>|-- {eveData.typeIDs?.[item.charge.type_id]?.name}</option>
              )}
            </React.Fragment>
          ))}
        </select>

        {tab === "JSON" && <pre>{JSON.stringify(snapshot.currentFit, null, 2)}</pre>}
        {tab !== "JSON" && <CalculationDetail source={tab} />}
      </div>
    </>
  );
};
