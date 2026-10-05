import { useAttribute } from "@eveshipfit/react-hooks";

import { range, unit } from "../../ShipStatistics/units";
import { Attribute, useDisplayName } from "./parts/Attribute";
import { BonusLine, useBonus } from "./parts/Bonus";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

const passive = "signatureSuppressorSignatureRadiusBonusPassive";

export function TargetPainter({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} falloff="falloffEffectiveness" label="Range" format={range} />
      <BonusLine bonus={useBonus("signatureRadiusBonus", itemRef)} />
    </>
  );
}

export function SignatureSuppressor({ itemRef }: LineProps) {
  const bonus = useAttribute(passive, {
    of: itemRef,
    decimals: 0,
    format: (value, format) => unit("%")((1 - value) * 100, format),
  });
  return (
    <Attribute name={passive}>
      {bonus.text} {useDisplayName(passive)}
    </Attribute>
  );
}
