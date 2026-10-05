import type { ItemRef } from "@eveshipfit/fitting";
import { formatNumber, useAttribute, type AttributeOptions } from "@eveshipfit/react-hooks";

import { unit } from "../../../ShipStatistics/units";
import styles from "../../ModuleTooltip.module.css";
import { Attribute, useDisplayName } from "./Attribute";

const percent = unit("%");

export interface BonusValue {
  name: string;
  value: number | undefined;
  text: string;
  displayName: string | undefined;
}

export function useBonus(
  name: string,
  itemRef: ItemRef,
  { decimals = 0, fixed, format = percent }: Pick<AttributeOptions, "decimals" | "fixed" | "format"> = {},
): BonusValue {
  const { value, text } = useAttribute(name, { of: itemRef, decimals, fixed, format });
  return { name, value, text, displayName: useDisplayName(name) };
}

/** "-17% Falloff Bonus"; nothing when the bonus is 0. */
export function BonusLine({ bonus }: { bonus: BonusValue }) {
  if (!bonus.value) return null;
  return (
    <Attribute name={bonus.name}>
      {bonus.text} {bonus.displayName}
    </Attribute>
  );
}

/** The four sensor strengths, one line each. */
export function SensorStrengths({ strengths }: { strengths: BonusValue[] }) {
  const shown = strengths.filter(({ value }) => value);
  if (shown.length === 0) return null;
  return (
    <Attribute name="ECMResistance">
      <span className={styles.block}>
        {shown.map((strength) => (
          <span key={strength.name}>
            {strength.text} {strength.displayName}
          </span>
        ))}
      </span>
    </Attribute>
  );
}

/** The four ECM jammer strengths, like "5.8 Gravimetric ECM Jammer Strength". */
export function JammerStrengths({ itemRef }: { itemRef: ItemRef }) {
  const options = { decimals: 1, fixed: true, format: formatNumber };
  return (
    <SensorStrengths
      strengths={[
        useBonus("scanGravimetricStrengthBonus", itemRef, options),
        useBonus("scanLadarStrengthBonus", itemRef, options),
        useBonus("scanMagnetometricStrengthBonus", itemRef, options),
        useBonus("scanRadarStrengthBonus", itemRef, options),
      ]}
    />
  );
}
