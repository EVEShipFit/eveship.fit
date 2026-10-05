import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import styles from "../ModuleTooltip.module.css";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

const kilometers = unit(" km", 1000);
const percent = unit("%");

export function RemoteSensorBooster({ itemRef }: LineProps) {
  const strengths = [
    useBonus("scanGravimetricStrengthPercent", itemRef),
    useBonus("scanLadarStrengthPercent", itemRef),
    useBonus("scanMagnetometricStrengthPercent", itemRef),
    useBonus("scanRadarStrengthPercent", itemRef),
  ].filter(({ value }) => value);

  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={kilometers} />
      <BonusLine bonus={useBonus("scanResolutionBonus", itemRef)} />
      <BonusLine bonus={useBonus("maxTargetRangeBonus", itemRef)} />
      {strengths.length > 0 && (
        <Attribute name="ECMResistance">
          <span className={styles.block}>
            {strengths.map((strength) => (
              <span key={strength.name}>
                {strength.text} {strength.displayName}
              </span>
            ))}
          </span>
        </Attribute>
      )}
    </>
  );
}

interface Bonus {
  name: string;
  value: number | undefined;
  text: string;
  displayName: string | undefined;
}

function BonusLine({ bonus }: { bonus: Bonus }) {
  if (!bonus.value) return null;
  return (
    <Attribute name={bonus.name}>
      {bonus.text} {bonus.displayName}
    </Attribute>
  );
}

function useBonus(name: string, itemRef: ItemRef): Bonus {
  const { value, text } = useAttribute(name, { of: itemRef, decimals: 0, format: percent });
  return { name, value, text, displayName: useDisplayName(name) };
}
