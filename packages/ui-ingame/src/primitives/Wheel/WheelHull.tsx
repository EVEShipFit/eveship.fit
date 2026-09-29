import { lazy, Suspense } from "react";

import styles from "./WheelHull.module.css";

const WheelHologram = lazy(() => import("./WheelHologram").then((module) => ({ default: module.WheelHologram })));

const models: Partial<Record<number, string>> = {
  587: new URL("./hologram/rifter.glb", import.meta.url).href,
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
  const model = models[typeId];
  const render = (
    <img
      className={styles.hull}
      src={`https://images.evetech.net/types/${typeId}/render?size=1024`}
      alt=""
      draggable={false}
    />
  );
  if (model === undefined || !supportsWebgl()) return render;

  return (
    <Suspense fallback={render}>
      <WheelHologram model={model} />
    </Suspense>
  );
}
