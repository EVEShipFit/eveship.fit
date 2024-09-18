import React from "react";
import type { Metadata } from "next";

import "./globals.css";
import { Noto_Sans } from "next/font/google";

import { Layout } from "@/components/Layout";

const font = Noto_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVEShip.fit",
  description: "View, Create, and Share your EVE Online ship fits online",
  referrer: "origin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
