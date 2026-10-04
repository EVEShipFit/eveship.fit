import { useImages } from "@eveshipfit/react-hooks";
import { useEffect, useState, type CSSProperties } from "react";

import styles from "./WheelGauge.module.css";

export type WheelResource = "cpu" | "powergrid" | "calibration";

/**
 * EVE has one gauge texture, CPU's; powergrid mirrors it and calibration turns it round. Angles are in the texture's
 * own, measured from EVE; CPU starts half a degree early so its first mark sits beside powergrid's.
 */
const gauges: Record<WheelResource, { name: string; turn: string; from: number; sweep: number }> = {
  cpu: { name: "CPU", turn: "none", from: 134.5, sweep: 44.3 },
  powergrid: { name: "Powergrid", turn: "matrix(0, 1, 1, 0, 0, 0)", from: 135, sweep: 45 },
  calibration: { name: "Calibration", turn: "rotate(180deg)", from: 133, sweep: 30.5 },
};

const decoded = new Set<string>();

function useDecoded(src: string | undefined) {
  const [ready, setReady] = useState<string>();

  useEffect(() => {
    if (src === undefined || decoded.has(src)) return;
    const image = new Image();
    image.src = src;
    image.decode().then(
      () => {
        decoded.add(src);
        setReady(src);
      },
      () => {},
    );
  }, [src]);

  return src !== undefined && (ready === src || decoded.has(src));
}

export interface WheelGaugeProps {
  resource: WheelResource;
  used: number;
  total: number;
  valueText?: string;
}

export function WheelGauge({ resource, used, total, valueText }: WheelGaugeProps) {
  const images = useImages();
  const { name, turn, from, sweep } = gauges[resource];
  const texture = images.uiTexture("classes/fitting/fittingbase_gauge");
  const ready = useDecoded(texture);
  const share = total > 0 ? Math.min(used / total, 1) : 0;
  const to = from - sweep * share;

  return (
    <div
      className={styles.gauge}
      style={
        {
          "--texture": `url(${texture})`,
          "--used": `conic-gradient(transparent ${to}deg, black ${to}deg ${from}deg, transparent ${from}deg)`,
          "--turn": turn,
        } as CSSProperties
      }
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <meter> cannot be drawn as EVE's texture.
      role="meter"
      aria-label={name}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={used}
      aria-valuetext={valueText}
      data-resource={resource}
      data-over={used > total || undefined}
      data-loading={!ready || undefined}
    />
  );
}
