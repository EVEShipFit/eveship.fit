import React from "react";

import styles from "./Skills.module.css";
import { EsiContext, EveDataContext } from "@eveshipfit/react";

export const Skills = ({ setSkills }: { setSkills: (skills: Record<string, number>) => void }) => {
  const [skillSet, setSkillSet] = React.useState<string>("all-l5");
  const eveData = React.useContext(EveDataContext);
  const esi = React.useContext(EsiContext);

  React.useEffect(() => {
    if (!eveData?.loaded || !eveData?.typeIDs) return;

    if (skillSet === "all-l0") {
      const newSkills: Record<string, number> = {};
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
        newSkills[typeId] = 0;
      }
      setSkills(newSkills);
      return;
    }

    if (skillSet === "all-l5") {
      const newSkills: Record<string, number> = {};
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
        newSkills[typeId] = 5;
      }
      setSkills(newSkills);
      return;
    }

    const skills = esi.characters[skillSet]?.skills;
    if (!skills) return;

    setSkills(skills);
  }, [eveData, esi.characters, setSkills, skillSet]);

  React.useEffect(() => {
    if (skillSet === "all-l0" || skillSet === "all-l5") return;
    if (!esi.currentCharacter) return;
    if (skillSet === esi.currentCharacter) return;

    setSkillSet(esi.currentCharacter);
  }, [esi.currentCharacter, skillSet]);

  /* Synchronize the skillSet with the ESI character selection. */
  const changeSkillSet = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSkillSet = e.target.value;

    if (newSkillSet === "all-l0" || newSkillSet === "all-l5") {
      setSkillSet(newSkillSet);
      return;
    }

    const changeCharacter = esi.changeCharacter;
    changeCharacter(newSkillSet);
    setSkillSet(newSkillSet);
  }, [esi.changeCharacter]);

  return <div className={styles.skills}>
    <select onChange={changeSkillSet} value={skillSet}>
      <option value="all-l0">All skills L0</option>
      <option value="all-l5">All skills L5</option>
      {Object.entries(esi.characters).map(([id, name]) => {
        return <option key={id} value={id}>{name.name}</option>
      })}
    </select>
  </div>
}
