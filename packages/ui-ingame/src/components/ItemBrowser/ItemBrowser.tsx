import { useBrowse } from "@eveshipfit/react-hooks";
import { Activity, useDeferredValue, useId, useState, type ReactNode } from "react";

import { focusTree, isTreeRow } from "../../primitives/TreeList/TreeList";
import { Charges } from "./Charges";
import { FitActions } from "./FitActions";
import { HullsAndFits } from "./HullsAndFits";
import { Implants } from "./Implants";
import styles from "./ItemBrowser.module.css";
import { Modules } from "./Modules";

export interface ItemBrowserProps {
  label?: string;
}

type Tab = "hulls" | "modules" | "charges" | "implants";

/** EVE's browser of hulls and fits, modules, charges, and implants, left of the fitting wheel. */
export function ItemBrowser({ label = "Item Browser" }: ItemBrowserProps) {
  const [tab, setTab] = useState<Tab>("hulls");
  const { request } = useBrowse();
  const [browsed, setBrowsed] = useState(request);
  if (request !== browsed) {
    setBrowsed(request);
    if (request !== undefined) setTab(typeof request.target === "string" ? "modules" : "implants");
  }
  const id = useId();
  const ready = useDeferredValue(true, false);

  const tabs: { tab: Tab; label: string; panel: ReactNode }[] = [
    { tab: "hulls", label: "Hulls & Fits", panel: <HullsAndFits /> },
    { tab: "modules", label: "Modules", panel: <Modules /> },
    { tab: "charges", label: "Charges", panel: <Charges /> },
    { tab: "implants", label: "Implants", panel: <Implants /> },
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
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Handles the keys of its search and tree.
        <div
          key={each.tab}
          id={`${id}-${each.tab}-panel`}
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`${id}-${each.tab}-tab`}
          hidden={tab !== each.tab}
          onKeyDown={(event) => {
            if (event.defaultPrevented || event.nativeEvent.isComposing) return;
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            const panel = event.currentTarget;
            const target = event.target as HTMLElement;
            if (event.key === "ArrowDown" && target.matches("input[type=search]")) {
              if (focusTree(panel)) event.preventDefault();
            } else if (event.key === "ArrowUp" && isTreeRow(target)) {
              const search = panel.querySelector<HTMLInputElement>("input[type=search]");
              if (search === null) return;
              event.preventDefault();
              search.focus();
            }
          }}
        >
          {ready ? (
            <Activity mode={tab === each.tab ? "visible" : "hidden"}>{each.panel}</Activity>
          ) : (
            <p className={styles.empty}>Loading…</p>
          )}
        </div>
      ))}
      <FitActions />
    </section>
  );
}
