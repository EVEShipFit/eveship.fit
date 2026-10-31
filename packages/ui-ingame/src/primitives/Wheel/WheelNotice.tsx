import styles from "./WheelNotice.module.css";

export interface WheelNoticeProps {
  text: string;
}

/** A notice written across the wheel, under the hull. */
export function WheelNotice({ text }: WheelNoticeProps) {
  return (
    <svg className={styles.notice} viewBox="-320 -320 640 640">
      <text className={styles.text} y={150} textAnchor="middle">
        {text}
      </text>
    </svg>
  );
}
