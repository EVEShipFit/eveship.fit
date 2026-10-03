import { useCharacters } from "@eveshipfit/react-hooks";

import styles from "./Skills.module.css";

/** The dropdown to pick which skills fly the fit. */
export function Skills() {
  const { characters, current, select } = useCharacters();

  return (
    <>
      <label className={styles.skills}>
        Skills:
        <select className={styles.select} value={current} onChange={(e) => select(e.target.value)}>
          {characters.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <span className={styles.separator} />
    </>
  );
}
