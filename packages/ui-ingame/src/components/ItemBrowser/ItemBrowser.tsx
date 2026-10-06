import { Activity, useId, useState, type ReactNode } from "react";

import { Charges } from "./Charges";
import { FitActions } from "./FitActions";
import { HullsAndFits } from "./HullsAndFits";
import styles from "./ItemBrowser.module.css";
import { Modules } from "./Modules";

export interface ItemBrowserProps {
  label?: string;
}

type Tab = "hulls" | "modules" | "charges";

/** EVE's browser of hulls and fits, modules and charges, left of the fitting wheel. */
export function ItemBrowser({ label = "Item Browser" }: ItemBrowserProps) {
  const [tab, setTab] = useState<Tab>("hulls");
  const id = useId();

  const tabs: { tab: Tab; label: string; panel: ReactNode }[] = [
    { tab: "hulls", label: "Hulls & Fits", panel: <HullsAndFits /> },
    { tab: "modules", label: "Modules", panel: <Modules /> },
    { tab: "charges", label: "Charges", panel: <Charges /> },
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
          <Activity mode={tab === each.tab ? "visible" : "hidden"}>{each.panel}</Activity>
        </div>
      ))}
      <FitActions />
    </section>
  );
}
