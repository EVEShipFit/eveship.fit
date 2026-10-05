import { range } from "../../ShipStatistics/units";
import { Range } from "./parts/Range";
import type { LineProps } from "./index";

export function ShipScanner({ itemRef }: LineProps) {
  return <Range itemRef={itemRef} optimal="shipScanRange" label="Range" format={range} />;
}

export function CargoScanner({ itemRef }: LineProps) {
  return <Range itemRef={itemRef} optimal="cargoScanRange" label="Range" format={range} />;
}
