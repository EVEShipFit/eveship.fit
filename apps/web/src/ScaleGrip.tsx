import { useRef, useState, type PointerEvent } from "react";

import { UI_SCALES } from "./layout";
import styles from "./ScaleGrip.module.css";

export interface ScaleGripProps {
  /** The UI scale the window is at now. */
  scale: number;
  /** The largest UI scale to pick. */
  maxScale: number;
  /** Called with the UI scale dragged to, and once more with `done` on release. */
  onScale: (scale: number, done: boolean) => void;
}

interface Drag {
  centerX: number;
  centerY: number;
  distance: number;
  scale: number;
  picked?: number;
}

/** A corner to drag to scale the window it sits in, snapping to the UI scales. */
export function ScaleGrip({ scale, maxScale, onScale }: ScaleGripProps) {
  const drag = useRef<Drag | undefined>(undefined);
  const [dragging, setDragging] = useState(false);

  const nearest = (wanted: number) =>
    UI_SCALES.filter((option) => option <= maxScale).reduce((best, option) =>
      Math.abs(option - wanted) < Math.abs(best - wanted) ? option : best,
    );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    if (distance === 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { centerX, centerY, distance, scale };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (start === undefined) return;
    const distance = Math.hypot(event.clientX - start.centerX, event.clientY - start.centerY);
    const next = nearest((start.scale * distance) / start.distance);
    if (next === (start.picked ?? nearest(start.scale))) return;
    start.picked = next;
    onScale(next, false);
  };

  const onPointerUp = () => {
    const picked = drag.current?.picked;
    if (picked !== undefined) onScale(picked, true);
    drag.current = undefined;
    setDragging(false);
  };

  return (
    <div
      className={styles.grip}
      title="Drag to scale the UI"
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {dragging && <span className={styles.label}>{Math.round(scale * 100)}%</span>}
    </div>
  );
}
