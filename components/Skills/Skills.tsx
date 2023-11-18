import React from "react";

import styles from "./Skills.module.css";
import { EveDataContext } from "@eveshipfit/react";

export const Skills = ({ setSkills }: { setSkills: (skills: Record<string, number>) => void }) => {
  const [activeSkillOptions, setActiveSkillOptions] = React.useState<string>("all-l5");
  const eveData = React.useContext(EveDataContext);

  React.useEffect(() => {
    if (!eveData?.loaded || !eveData?.typeIDs) return;

    if (activeSkillOptions === "all-l0") {
      const newSkills: Record<string, number> = {};
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
        newSkills[typeId] = 0;
      }
      setSkills(newSkills);
      return;
    }

    if (activeSkillOptions === "all-l5") {
      const newSkills: Record<string, number> = {};
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
        newSkills[typeId] = 5;
      }
      setSkills(newSkills);
      return;
    }
  }, [eveData, setSkills, activeSkillOptions]);

  return <div className={styles.skills}>
    <select onClick={e => setActiveSkillOptions(e.currentTarget.value)}>
      <option value="all-l0">All skills L0</option>
      <option value="all-l5">All skills L5</option>
    </select>
  </div>
}
