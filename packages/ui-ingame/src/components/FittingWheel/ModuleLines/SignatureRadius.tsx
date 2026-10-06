import { ActivationRange } from "./ActivationRange";
import { AttributeLine } from "./parts/Attribute";
import { BonusLine, percent } from "./parts/Bonus";
import type { LineProps } from "./index";

export function TargetPainter(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <BonusLine itemRef={props.itemRef} name="signatureRadiusBonus" />
    </>
  );
}

export function SignatureSuppressor({ itemRef }: LineProps) {
  return (
    <AttributeLine
      itemRef={itemRef}
      name="signatureSuppressorSignatureRadiusBonusPassive"
      decimals={0}
      format={(value, format) => percent((1 - value) * 100, format)}
    />
  );
}
