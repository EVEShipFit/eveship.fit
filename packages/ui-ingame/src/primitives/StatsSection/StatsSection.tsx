import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./StatsSection.module.css";

export interface StatsSectionProps {
  title: string;
  summary?: ReactNode;
  /** A control in the header, before `summary`. */
  action?: ReactNode;
  /** How many `Stat`s go next to each other. */
  columns?: 1 | 2;
  children: ReactNode;
}

export function StatsSection({ title, summary, action, columns = 1, children }: StatsSectionProps) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const summaryId = useId();

  return (
    <section className={styles.section} aria-label={title} data-closed={!open || undefined}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-describedby={summary === undefined ? undefined : summaryId}
          onClick={() => setOpen(!open)}
        >
          <Icon name="arrow-down" />
          <span className={styles.title}>{title}</span>
        </button>
        {action !== undefined && <div className={styles.action}>{action}</div>}
        {summary !== undefined && <span id={summaryId}>{summary}</span>}
      </div>
      <div id={bodyId} className={styles.body} inert={!open}>
        <div className={styles.clip}>
          <div className={styles.content} style={{ "--columns": columns } as CSSProperties}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
