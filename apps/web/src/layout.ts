import { useEffect, useState } from "react";

// EVE's pixels at 100%, as the FittingWindow, ItemBrowser and ShipStatistics measure them.
const WINDOW_WIDTH = 1380;
const WINDOW_HEIGHT = 694;
const COLLAPSED_WIDTH = 708;
const BROWSER_WIDTH = 393;
const PANEL_PADDING = 12;

const MIN_SIDE_BY_SIDE_SCALE = 0.6;

const UI_SCALE_KEY = "eveshipfit.uiScale";

/** The UI scales to pick from, as EVE offers them. */
export const UI_SCALES = [0.9, 1, 1.1, 1.25, 1.5];

/** The UI scale last picked; 100% when none is. */
export function keptUiScale(): number {
  try {
    const kept = Number(localStorage.getItem(UI_SCALE_KEY));
    return UI_SCALES.includes(kept) ? kept : 1;
  } catch (error) {
    console.error(error);
    return 1;
  }
}

export function keepUiScale(scale: number) {
  try {
    localStorage.setItem(UI_SCALE_KEY, String(scale));
  } catch (error) {
    console.error(error);
  }
}

export interface Layout {
  /** The item browser and statistics below the window instead of slid out next to it. */
  stacked: boolean;
  /** EVE's UI scale for the window. */
  scale: number;
  /** EVE's UI scale for the item browser and statistics, when stacked. */
  panelScale: number;
}

function layoutFor(width: number, height: number, uiScale: number): Layout {
  const sideBySide = Math.min(width / WINDOW_WIDTH, height / WINDOW_HEIGHT);
  // Stacked, the page scrolls to the statistics; so only the width limits the window.
  const stacked = Math.min(1, uiScale, width / COLLAPSED_WIDTH);
  const portrait = width < height;
  if (sideBySide >= MIN_SIDE_BY_SIDE_SCALE && !(portrait && stacked > sideBySide)) {
    return { stacked: false, scale: Math.floor(Math.min(uiScale, sideBySide) * 100) / 100, panelScale: 1 };
  }
  const panel = Math.min(1, width / (BROWSER_WIDTH + 2 * PANEL_PADDING));
  return { stacked: true, scale: Math.floor(stacked * 100) / 100, panelScale: Math.floor(panel * 100) / 100 };
}

/** The layout that fits in `main` above `footer`, at most at `uiScale`. */
export function useLayout(main: HTMLElement | null, footer: HTMLElement | null, uiScale: number): Layout {
  const [layout, setLayout] = useState<Layout>({ stacked: false, scale: 1, panelScale: 1 });

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
      const next = layoutFor(width, height, uiScale);
      setLayout((current) =>
        current.stacked === next.stacked && current.scale === next.scale && current.panelScale === next.panelScale
          ? current
          : next,
      );
    });
    observer.observe(main);
    observer.observe(footer);
    return () => observer.disconnect();
  }, [main, footer, uiScale]);

  return layout;
}
