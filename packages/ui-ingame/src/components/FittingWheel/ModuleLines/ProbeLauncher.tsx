import { formatNumber, useAttribute } from "@eveshipfit/react-hooks";

import { Attribute, useDisplayName } from "./parts/Attribute";
import type { LineProps } from "./index";

export function ProbeLauncher({ itemRef }: LineProps) {
  const strength = useAttribute("baseSensorStrength", { of: itemRef, charge: true, decimals: 0 });
  const loaded = strength.value !== undefined;
  const dps = useAttribute("damagePerSecondWithoutReload", {
    of: itemRef,
    decimals: loaded ? 1 : 0,
    fixed: true,
    fallback: 0,
    format: formatNumber,
  });
  const displayName = useDisplayName("baseSensorStrength");
  return (
    <>
      <Attribute name="launcherHardPointModifier">Damage Per Second {dps.text}</Attribute>
      {!!strength.value && (
        <Attribute name="baseSensorStrength">
          {displayName}: {strength.text}
        </Attribute>
      )}
    </>
  );
}
