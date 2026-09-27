import { useId, useState, type ReactNode } from "react";

import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { HullsAndFits } from "./HullsAndFits";
import styles from "./ItemBrowser.module.css";
import { Modules } from "./Modules";

export interface ItemBrowserProps {
  label?: string;
}

type Tab = "hulls" | "modules";

/** EVE's browser of hulls and fits, modules and charges, left of the fitting wheel. */
export function ItemBrowser({ label = "Item Browser" }: ItemBrowserProps) {
  const [tab, setTab] = useState<Tab>("hulls");
  const id = useId();

  const tabs: { tab: Tab; label: string; panel: ReactNode }[] = [
    { tab: "hulls", label: "Hulls & Fits", panel: <HullsAndFits /> },
    { tab: "modules", label: "Modules", panel: <Modules /> },
  ];

  return (
    <section className={styles.browser} aria-label={label}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((each) => (
          <button
            key={each.tab}
            type="button"
            id={`${id}-${each.tab}-tab`}
            className={styles.tab}
            role="tab"
            aria-selected={tab === each.tab}
            aria-controls={`${id}-${each.tab}-panel`}
            onClick={() => setTab(each.tab)}
          >
            {each.label}
          </button>
        ))}
        <NotImplementedTab label="Charges" />
      </div>
      {tabs.map((each) => (
        <div
          key={each.tab}
          id={`${id}-${each.tab}-panel`}
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`${id}-${each.tab}-tab`}
          hidden={tab !== each.tab}
        >
          {each.panel}
        </div>
      ))}
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
