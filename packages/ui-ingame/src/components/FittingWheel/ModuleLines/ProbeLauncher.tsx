import { useAttribute } from "@eveshipfit/react-hooks";

import { AttributeLine, nameFirst } from "./parts/Attribute";
import { DamagePerSecond } from "./parts/DamagePerSecond";
import type { LineProps } from "./index";

export function ProbeLauncher({ itemRef }: LineProps) {
  const loaded = useAttribute("baseSensorStrength", { of: itemRef, charge: true }).value !== undefined;
  return (
    <>
      <DamagePerSecond itemRef={itemRef} icon="launcherHardPointModifier" decimals={loaded ? 1 : 0} />
      <AttributeLine itemRef={itemRef} name="baseSensorStrength" charge decimals={0} layout={nameFirst} hideZero />
    </>
  );
}
