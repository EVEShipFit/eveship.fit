import { useId } from "react";

import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { HullsAndFits } from "./HullsAndFits";
import styles from "./ItemBrowser.module.css";

export interface ItemBrowserProps {
  label?: string;
}

/** EVE's browser of hulls and fits, modules and charges, left of the fitting wheel. */
export function ItemBrowser({ label = "Item Browser" }: ItemBrowserProps) {
  const tabId = useId();
  const panelId = useId();

  return (
    <section className={styles.browser} aria-label={label}>
      <div className={styles.tabs} role="tablist">
        <button type="button" id={tabId} className={styles.tab} role="tab" aria-selected aria-controls={panelId}>
          Hulls &amp; Fits
        </button>
        <NotImplementedTab label="Modules" />
        <NotImplementedTab label="Charges" />
      </div>
      <div id={panelId} className={styles.panel} role="tabpanel" aria-labelledby={tabId}>
        <HullsAndFits />
      </div>
    </section>
  );
}

function NotImplementedTab({ label }: { label: string }) {
  return (
    <Tooltip label={`${label} (not implemented yet)`}>
      <button type="button" className={styles.tab} role="tab" aria-selected={false} aria-disabled>
        {label}
      </button>
    </Tooltip>
  );
}
