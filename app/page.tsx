import React from "react";
import { Metadata } from "next";

import { PageMain } from "@/components/Pages";

import styles from "./page.module.css";

const imageUrl = "https://preview.eveship.fit/?fit=ENCODED_ESF_FIT";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    images: [{ url: imageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: imageUrl }],
  },
};

export default function Home() {
  return (
    <main id="main" className={styles.main}>
      <PageMain />
    </main>
  );
}
