import { unit } from "../../ShipStatistics/units";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";
import { Range } from "./parts/Range";

const kilometers = unit(" km", 1000);

export function RemoteCapacitorTransmitter({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={kilometers} />
      <PerCycle itemRef={itemRef} name="powerTransferAmount" label="Points" decimals={2} />
    </>
  );
}
