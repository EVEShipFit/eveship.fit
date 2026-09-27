import { Icon } from "../Icon/Icon";
import styles from "./HistoryBar.module.css";

export interface HistoryBarProps {
  label: string;
  length: number;
  /** 0 is the oldest. */
  position: number;
  onGoTo: (position: number) => void;
}

/** EVE's Simulation History. */
export function HistoryBar({ label, length, position, onGoTo }: HistoryBarProps) {
  return (
    <fieldset className={styles.history} aria-label={label}>
      <span className={styles.title} aria-hidden>
        {label}
      </span>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Back"
          disabled={position <= 0}
          onClick={() => onGoTo(position - 1)}
        >
          <Icon name="arrow-left" size={10} />
        </button>
        <div className={styles.entries}>
          {Array.from({ length }, (_, index) => (
            <button
              key={index}
              type="button"
              className={styles.entry}
              aria-label={`${index + 1} of ${length}`}
              aria-current={index === position || undefined}
              onClick={() => onGoTo(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Forward"
          disabled={position >= length - 1}
          onClick={() => onGoTo(position + 1)}
        >
          <Icon name="arrow-right" size={10} />
        </button>
      </div>
    </fieldset>
  );
}
