import { useRef, useState, type PointerEvent } from "react";

import { UI_SCALES } from "./layout";
import styles from "./ScaleGrip.module.css";

// EVE's pixels at 100%, as the FittingWindow measures them.
const COLLAPSED_WIDTH = 708;
const WINDOW_HEIGHT = 694;
const BROWSER_SLIDE = 400;
const STATISTICS_SLIDE = 272;
const DEAD_ZONE = 4;

export interface ScaleGripProps {
  /** The UI scale the window is at now. */
  scale: number;
  /** The largest UI scale to pick. */
  maxScale: number;
  /** Called with the UI scale dragged to. */
  onScale: (scale: number) => void;
}

interface Drag {
  panel: HTMLElement;
  startX: number;
  startY: number;
  /** The point that stays in place when scaling. */
  centerX: number;
  centerY: number;
  distance: number;
  picked?: number;
}

interface Outline {
  scale: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where the window in `panel` would be at `scale`, relative to where it is. */
function outlineAt(panel: HTMLElement, scale: number): Outline {
  const rect = panel.getBoundingClientRect();
  const stage = panel.parentElement!.getBoundingClientRect();
  const browser = panel.querySelector(":scope > [data-browser]") === null ? 0 : BROWSER_SLIDE;
  const statistics = panel.querySelector(":scope > [data-statistics]") === null ? 0 : STATISTICS_SLIDE;
  const width = (COLLAPSED_WIDTH + browser + statistics) * scale + 2;
  const height = WINDOW_HEIGHT * scale + 2;
  const left = Math.max(0, Math.min(stage.width / 2 - (browser + COLLAPSED_WIDTH / 2) * scale, stage.width - width));
  const top = Math.max(0, (stage.height - height) / 2);
  return { scale, left: stage.left + left - rect.left - 1, top: stage.top + top - rect.top - 1, width, height };
}

/** A corner to drag to scale the window it sits in, outlining the UI scale it snaps to. */
export function ScaleGrip({ scale, maxScale, onScale }: ScaleGripProps) {
  const drag = useRef<Drag | undefined>(undefined);
  const [outline, setOutline] = useState<Outline | undefined>(undefined);

  const nearest = (wanted: number) =>
    UI_SCALES.filter((option) => option <= maxScale).reduce((best, option) =>
      Math.abs(option - wanted) < Math.abs(best - wanted) ? option : best,
    );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const panel = event.currentTarget.parentElement!;
    const rect = panel.getBoundingClientRect();
    const browser = panel.querySelector(":scope > [data-browser]") === null ? 0 : BROWSER_SLIDE;
    const centerX = rect.left + 1 + (browser + COLLAPSED_WIDTH / 2) * scale;
    const centerY = rect.top + 1 + (WINDOW_HEIGHT / 2) * scale;
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    if (distance === 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { panel, startX: event.clientX, startY: event.clientY, centerX, centerY, distance };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (start === undefined) return;
    if (
      start.picked === undefined &&
      Math.hypot(event.clientX - start.startX, event.clientY - start.startY) < DEAD_ZONE
    ) {
      return;
    }
    const distance = Math.hypot(event.clientX - start.centerX, event.clientY - start.centerY);
    const next = nearest((scale * distance) / start.distance);
    if (next === start.picked) return;
    start.picked = next;
    setOutline(outlineAt(start.panel, next));
  };

  const onPointerUp = () => {
    const picked = drag.current?.picked;
    if (picked !== undefined && picked !== scale) onScale(picked);
    drag.current = undefined;
    setOutline(undefined);
  };

  const onPointerCancel = () => {
    drag.current = undefined;
    setOutline(undefined);
  };

  return (
    <>
      {outline !== undefined && (
        <div
          className={styles.outline}
          data-testid="scale-outline"
          style={{ left: outline.left, top: outline.top, width: outline.width, height: outline.height }}
        >
          <span className={styles.label}>{Math.round(outline.scale * 100)}%</span>
        </div>
      )}
      <div
        className={styles.grip}
        title="Drag to scale the UI"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </>
  );
}
