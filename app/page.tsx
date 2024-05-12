import React from "react";
import { Banner } from "@/components/Banner";
import { Debug } from "@/components/Debug";

import { FittingWindow } from "@/components/FittingWindow";

export default function Home() {
  return (
    <>
      <Banner />
      <FittingWindow />
      <Debug />
    </>
  );
}
