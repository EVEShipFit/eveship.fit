import React from "react";

import { useCurrentFit } from "@eveshipfit/react";

import styles from "./PreviewHeader.module.css";

export const PreviewHeader = () => {
  const currentFit = useCurrentFit();

  return (
    <>
      <div className={styles.shipName}>{currentFit.fit?.name}</div>
      <div className={styles.skills}>Default character - All Skills L5</div>
    </>
  );
};
