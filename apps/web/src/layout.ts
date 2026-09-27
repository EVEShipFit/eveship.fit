import { useEffect, useState } from "react";

// EVE's pixels at 100%, as the FittingWindow and ShipStatistics measure them.
const WINDOW_WIDTH = 972;
const WINDOW_HEIGHT = 630;
const WHEEL_WIDTH = 700;
const PANEL_PADDING = 12;

const MIN_SIDE_BY_SIDE_SCALE = 0.6;
const MAX_SCALE = 1.5;

export interface Layout {
  /** The statistics below the window instead of slid out next to it. */
  stacked: boolean;
  /** EVE's UI scale for the window. */
  scale: number;
}

function layoutFor(width: number, height: number): Layout {
  const sideBySide = Math.min(width / (WINDOW_WIDTH + 2 * PANEL_PADDING), height / (WINDOW_HEIGHT + 2 * PANEL_PADDING));
  // Stacked, the page scrolls to the statistics; so only the width limits the window.
  const stacked = Math.min(1, width / (WHEEL_WIDTH + 2 * PANEL_PADDING));
  const portrait = width < height;
  if (sideBySide >= MIN_SIDE_BY_SIDE_SCALE && !(portrait && stacked > sideBySide)) {
    return { stacked: false, scale: Math.floor(Math.min(MAX_SCALE, sideBySide) * 100) / 100 };
  }
  return { stacked: true, scale: Math.floor(stacked * 100) / 100 };
}

/** The layout that fits in `main` above `footer`. */
export function useLayout(main: HTMLElement | null, footer: HTMLElement | null): Layout {
  const [layout, setLayout] = useState<Layout>({ stacked: false, scale: 1 });

  useEffect(() => {
    if (main === null || footer === null) return;

    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(main);
      const width = main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const height =
        main.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom) -
        parseFloat(style.rowGap) -
        footer.offsetHeight;
      const next = layoutFor(width, height);
      setLayout((current) => (current.stacked === next.stacked && current.scale === next.scale ? current : next));
    });
    observer.observe(main);
    observer.observe(footer);
    return () => observer.disconnect();
  }, [main, footer]);

  return layout;
}
