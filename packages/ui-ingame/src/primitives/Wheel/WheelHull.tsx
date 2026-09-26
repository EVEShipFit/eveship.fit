import styles from "./WheelHull.module.css";

export interface WheelHullProps {
  /** The ship's type. */
  typeId: number;
}

/** The ship's render, round, behind the `Wheel`'s rings. */
export function WheelHull({ typeId }: WheelHullProps) {
  return (
    <img
      className={styles.hull}
      src={`https://images.evetech.net/types/${typeId}/render?size=1024`}
      alt=""
      draggable={false}
    />
  );
}
