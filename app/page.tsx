"use client";

import clsx from "clsx";
import React from "react";

import { DogmaEngineProvider, EsiCharacterSelection, EsiProvider, EveDataProvider, FitButtonBar, HardwareListing, HullListing, LocalFitProvider, ModalDialogAnchor, ShipFitExtended, ShipSnapshotProvider, ShipStatistics } from "@eveshipfit/react";
import type { EsiFit } from "@eveshipfit/react";

import { Banner } from "@/components/Banner";
import { LocationHash } from "@/components/LocationHash";

import styles from "./page.module.css";

const Page = () => {
  const [activeFit, setActiveFit] = React.useState<EsiFit>({"name": "C3 Ratter : NishEM", "ship_type_id": 29984, "description": "", "items": [{"flag": 125, "quantity": 1, "type_id": 45626}, {"flag": 126, "quantity": 1, "type_id": 45591}, {"flag": 127, "quantity": 1, "type_id": 45601}, {"flag": 128, "quantity": 1, "type_id": 45615}, {"flag": 11, "quantity": 1, "type_id": 22291}, {"flag": 12, "quantity": 1, "type_id": 22291}, {"flag": 13, "quantity": 1, "type_id": 22291}, {"flag": 19, "quantity": 1, "type_id": 41218}, {"flag": 20, "quantity": 1, "type_id": 35790}, {"flag": 21, "quantity": 1, "type_id": 2281}, {"flag": 22, "quantity": 1, "type_id": 15766}, {"flag": 23, "quantity": 1, "type_id": 19187}, {"flag": 24, "quantity": 1, "type_id": 19187}, {"flag": 25, "quantity": 1, "type_id": 35790}, {"flag": 27, "quantity": 1, "type_id": 25715}, {"flag": 28, "quantity": 1, "type_id": 25715}, {"flag": 29, "quantity": 1, "type_id": 25715}, {"flag": 30, "quantity": 1, "type_id": 25715}, {"flag": 31, "quantity": 1, "type_id": 25715}, {"flag": 32, "quantity": 1, "type_id": 25715}, {"flag": 33, "quantity": 1, "type_id": 28756}, {"flag": 92, "quantity": 1, "type_id": 31724}, {"flag": 93, "quantity": 1, "type_id": 31824}, {"flag": 94, "quantity": 1, "type_id": 31378}, {"flag": 5, "quantity": 3720, "type_id": 24492}, {"flag": 5, "quantity": 5472, "type_id": 2679}, {"flag": 5, "quantity": 1, "type_id": 35795}, {"flag": 5, "quantity": 1, "type_id": 35794}, {"flag": 5, "quantity": 8, "type_id": 30486}, {"flag": 5, "quantity": 1, "type_id": 35794}, {"flag": 5, "quantity": 396, "type_id": 24492}]});
  const [skills, setSkills] = React.useState<Record<string, number>>({});
  const [selection, setSelection] = React.useState<"hulls" | "hardware">("hulls");

  return <ShipSnapshotProvider fit={activeFit} skills={skills}>
    <EsiProvider setSkills={setSkills}>
      <LocalFitProvider>
        <LocationHash setFit={setActiveFit} />
        <Banner />
        <div className={styles.content}>
          <ModalDialogAnchor />
          <div className={styles.selection}>
            <div className={styles.selectionHeader}>
              <div onClick={() => setSelection("hulls")} className={clsx({[styles.selected]: selection == "hulls"})}>Hull & Fits</div>
              <div onClick={() => setSelection("hardware")} className={clsx({[styles.selected]: selection == "hardware"})}>Hardware</div>
            </div>
            <div className={clsx(styles.selectionContent, {[styles.collapsed]: selection != "hulls"})}>
              <HullListing />
            </div>
            <div className={clsx(styles.selectionContent, {[styles.collapsed]: selection != "hardware"})}>
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
      </LocalFitProvider>
    </EsiProvider>
  </ShipSnapshotProvider>;
}

export default function Home() {
  return (
    <main className={styles.main}>
      <EveDataProvider>
        <DogmaEngineProvider>
          <Page />
        </DogmaEngineProvider>
      </EveDataProvider>
    </main>
  )
}
