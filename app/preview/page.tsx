import React from "react";

import { PagePreview } from "@/components/Pages";

import styles from "./page.module.css";

export default function Home() {
  return (
    <main id="preview" className={styles.preview}>
      <PagePreview />
    </main>
  );
}
