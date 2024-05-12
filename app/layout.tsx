import React from "react";
import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";

import { FittingProviders } from "@/components/FittingProviders/FittingProviders";

import styles from "./layout.module.css";
import "./globals.css";

const font = Noto_Serif({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EVEShip.fit",
    template: "%s - EVEShip.fit",
  },
  description: "View, Create, and Share your EVE Online ship fits online",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eveship.fit",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <main className={styles.main}>
          <FittingProviders>{children}</FittingProviders>
        </main>
      </body>
    </html>
  );
}
