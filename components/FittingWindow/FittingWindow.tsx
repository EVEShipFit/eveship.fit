"use client";

import {
  ModalDialogAnchor,
  HullListing,
  HardwareListing,
  FitButtonBar,
  ShipFitExtended,
  EsiCharacterSelection,
  ShipStatistics,
} from "@eveshipfit/react";
import clsx from "clsx";
import React from "react";

import styles from "./FittingWindow.module.css";
import { LocationHash } from "../LocationHash";

export const FittingWindow: React.FC = () => {
  const [selection, setSelection] = React.useState<"hulls" | "hardware">("hulls");

  return (
    <div className={styles.content}>
      <LocationHash />
      <ModalDialogAnchor />
      <div className={styles.selection}>
        <div className={styles.selectionHeader}>
          <div onClick={() => setSelection("hulls")} className={clsx({ [styles.selected]: selection == "hulls" })}>
            Hull & Fits
          </div>
          <div
            onClick={() => setSelection("hardware")}
            className={clsx({ [styles.selected]: selection == "hardware" })}
          >
            Hardware
          </div>
        </div>
        <div
          className={clsx(styles.selectionContent, {
            [styles.collapsed]: selection != "hulls",
          })}
        >
          <HullListing />
        </div>
        <div
          className={clsx(styles.selectionContent, {
            [styles.collapsed]: selection != "hardware",
          })}
        >
          <HardwareListing />
        </div>
        <FitButtonBar />
      </div>
      <div className={styles.fit}>
        <ShipFitExtended />
      </div>
      <div className={styles.statistics}>
        <EsiCharacterSelection />
        <ShipStatistics />
      </div>
    </div>
  );
};
