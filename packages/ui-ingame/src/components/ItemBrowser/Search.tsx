import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import styles from "./ItemBrowser.module.css";

/** Past this many matches, a search leaves the groups closed. */
export const MOST_OPENED_BY_SEARCH = 200;

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onCollapse: () => void;
}

/** The search field above a list of the `ItemBrowser`, after a button that collapses every group. */
export function Search({ value, onChange, onCollapse }: SearchProps) {
  return (
    <div className={styles.search}>
      <Tooltip label="Collapse All Groups">
        <button type="button" className={styles.collapse} aria-label="Collapse All Groups" onClick={onCollapse}>
          <Icon name="collapse" />
        </button>
      </Tooltip>
      <label className={styles.field}>
        <Icon name="search" />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}
