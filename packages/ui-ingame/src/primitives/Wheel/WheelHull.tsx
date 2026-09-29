import { lazy, Suspense } from "react";

import type { Hull } from "./hologram/scene";
import styles from "./WheelHull.module.css";

const WheelHologram = lazy(() => import("./WheelHologram").then((module) => ({ default: module.WheelHologram })));

const hulls: Partial<Record<number, Hull>> = {
  587: {
    model: new URL("./hologram/rifter.glb", import.meta.url).href,
    normalMap: new URL("./hologram/rifter-normal.webp", import.meta.url).href,
  },
};

let webgl: boolean | undefined;
function supportsWebgl(): boolean {
  webgl ??= document.createElement("canvas").getContext("webgl2") !== null;
  return webgl;
}

export interface WheelHullProps {
  typeId: number;
}

export function WheelHull({ typeId }: WheelHullProps) {
  const hull = hulls[typeId];
  const render = (
    <img
      className={styles.hull}
      src={`https://images.evetech.net/types/${typeId}/render?size=1024`}
      alt=""
      draggable={false}
    />
  );
  if (hull === undefined || !supportsWebgl()) return render;

  return (
    <Suspense fallback={render}>
      <WheelHologram hull={hull} />
    </Suspense>
  );
}
