"use client";
import React from "react";

import { ShipFitExtended, ShipStatistics } from "@eveshipfit/react";

import { LocationHash } from "@/components/LocationHash";
import { PreviewHeader } from "@/components/PreviewHeader";

import styles from "./page.module.css";

export const PagePreview = () => {
  return (
    <>
      <LocationHash />
      <div className={styles.contentPreview}>
        <div className={styles.fit}>
          <ShipFitExtended isPreview />
        </div>
        <div className={styles.statistics}>
          <PreviewHeader />
          <ShipStatistics />
        </div>
      </div>
    </>
  );
};
