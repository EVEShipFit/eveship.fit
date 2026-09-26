import type { CSSProperties } from "react";

import { useImages } from "../../images";
import styles from "./WheelGauge.module.css";

export type WheelResource = "cpu" | "powergrid" | "calibration";

/**
 * EVE has one texture for the gauges: CPU's, which runs counter-clockwise from 135° to 90°. Powergrid is that texture
 * mirrored, and calibration that texture turned half way round. Each fills counter-clockwise, in the texture's own
 * angles, from `from` over `sweep` degrees, as measured from EVE's fitting window; CPU and powergrid start half a
 * degree apart, so that their first marks sit side by side.
 */
const gauges: Record<WheelResource, { name: string; turn: string; from: number; sweep: number }> = {
  cpu: { name: "CPU", turn: "none", from: 134.5, sweep: 44.3 },
  powergrid: { name: "Powergrid", turn: "matrix(0, 1, 1, 0, 0, 0)", from: 135, sweep: 45 },
  calibration: { name: "Calibration", turn: "rotate(180deg)", from: 133, sweep: 30.5 },
};

export interface WheelGaugeProps {
  resource: WheelResource;
  used: number;
  total: number;
  /** How screen readers read the value, like "61.3 of 162.5 tf". */
  valueText?: string;
}

/** How much of the ship's CPU, powergrid or calibration the fit uses, as an arc on the outer ring. */
export function WheelGauge({ resource, used, total, valueText }: WheelGaugeProps) {
  const images = useImages();
  const { name, turn, from, sweep } = gauges[resource];
  const share = total > 0 ? Math.min(used / total, 1) : 0;
  const to = from - sweep * share;

  return (
    <div
      className={styles.gauge}
      style={
        {
          "--texture": `url(${images.uiTexture("classes/fitting/fittingbase_gauge")})`,
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
    />
  );
}
