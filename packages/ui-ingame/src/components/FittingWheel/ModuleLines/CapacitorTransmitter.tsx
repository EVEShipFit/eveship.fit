import { ActivationRange } from "./ActivationRange";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";

export function RemoteCapacitorTransmitter(props: LineProps) {
  return (
    <>
      <ActivationRange {...props} />
      <PerCycle itemRef={props.itemRef} name="powerTransferAmount" label="Points" decimals={2} />
    </>
  );
}
