import { range } from "../../ShipStatistics/units";
import type { LineProps } from "./index";
import { PerCycle } from "./parts/PerCycle";
import { Range } from "./parts/Range";

export function RemoteCapacitorTransmitter({ itemRef }: LineProps) {
  return (
    <>
      <Range itemRef={itemRef} label="Range" format={range} />
      <PerCycle itemRef={itemRef} name="powerTransferAmount" label="Points" decimals={2} />
    </>
  );
}
