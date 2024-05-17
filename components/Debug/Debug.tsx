import React from "react";

import styles from "./Debug.module.css";
import {
  CalculationDetail,
  type CalculationSlot,
  type CalculationSlotType,
  useCurrentFit,
  useEveData,
  useStatistics,
} from "@eveshipfit/react";

const slotTypeToValue: Record<CalculationSlotType, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
  Rig: 3,
  SubSystem: 4,
  DroneBay: 5,
  Charge: 6,
};

const slotToOrder = (slot: CalculationSlot) => {
  return slotTypeToValue[slot.type] * 100 + (slot.index ?? 0);
};

export const Debug = () => {
  const currentFit = useCurrentFit();
  const eveData = useEveData();
  const statistics = useStatistics();

  const [tab, setTab] = React.useState<
    "JSON" | "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number }
  >("Ship");

  if (eveData === null || statistics === null) {
    return <></>;
  }

  const items =
    statistics.items
      .map((item, index) => {
        return { item, index };
      })
      .sort((a, b) => slotToOrder(a.item.slot) - slotToOrder(b.item.slot)) ?? [];

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
                {item.slot.type}[{item.slot.index}] - {eveData.typeIDs[item.type_id]?.name}
              </option>
              {item.charge && (
                <option value={`{"Charge":${index}}`}>|-- {eveData.typeIDs[item.charge.type_id]?.name}</option>
              )}
            </React.Fragment>
          ))}
        </select>

        {tab === "JSON" && <pre>{JSON.stringify(currentFit.fit, null, 2)}</pre>}
        {tab !== "JSON" && <CalculationDetail source={tab} />}
      </div>
    </>
  );
};
