import { useId } from "react";

import styles from "./WheelHint.module.css";

export interface WheelHintProps {
  text: string;
}

/** A hint written along the bottom of the wheel's rim. */
export function WheelHint({ text }: WheelHintProps) {
  const arc = useId();

  return (
    <svg className={styles.hint} viewBox="-320 -320 640 640">
      <path id={arc} d="M -292 0 A 292 292 0 0 0 292 0" fill="none" />
      <text className={styles.text} textAnchor="middle" dominantBaseline="hanging">
        <textPath href={`#${arc}`} startOffset="50%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
