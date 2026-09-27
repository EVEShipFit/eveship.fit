import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { Icon } from "../Icon/Icon";
import styles from "./StatsSection.module.css";

export interface StatsSectionProps {
  title: string;
  summary?: ReactNode;
  /** How many `Stat`s go next to each other. */
  columns?: 1 | 2;
  children: ReactNode;
}

export function StatsSection({ title, summary, columns = 1, children }: StatsSectionProps) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  return (
    <section className={styles.section} aria-label={title} data-closed={!open || undefined}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen(!open)}
      >
        <Icon name="arrow-down" />
        <span className={styles.title}>{title}</span>
        {summary}
      </button>
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
