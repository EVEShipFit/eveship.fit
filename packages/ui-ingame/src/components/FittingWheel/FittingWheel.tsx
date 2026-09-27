import {
  formatNumber,
  useAttribute,
  useCharges,
  useFit,
  useFitStore,
  useHardpoints,
  useRackUsage,
  useSlots,
  useType,
  type SlotContent,
} from "@eveshipfit/react-hooks";

import { rackSize, slotAngle, type WheelRack } from "../../primitives/Wheel/layout";
import { Wheel } from "../../primitives/Wheel/Wheel";
import { WheelGauge, type WheelResource } from "../../primitives/Wheel/WheelGauge";
import { WheelHardpoints } from "../../primitives/Wheel/WheelHardpoints";
import { WheelHull } from "../../primitives/Wheel/WheelHull";
import { WheelRackMarker, type MarkedRack } from "../../primitives/Wheel/WheelRackMarker";
import { WheelSlot, type WheelSlotProps } from "../../primitives/Wheel/WheelSlot";
import { nextState } from "./states";

const markedRacks: MarkedRack[] = ["high", "medium", "low"];
const racks: WheelRack[] = ["high", "medium", "low", "rig", "subsystem"];
/** EVE does not let rigs and subsystems be put offline. */
const switchedRacks: WheelRack[] = ["high", "medium", "low"];

export interface FittingWheelProps {
  label?: string;
}

/** The fitting wheel of the fit in the surrounding `EveShipFitProvider`. */
export function FittingWheel({ label = "Fitting" }: FittingWheelProps) {
  const ship = useFit().ship.type_id;
  const { turret, launcher } = useHardpoints();

  return (
    <Wheel label={label}>
      <WheelHull typeId={ship} />
      {markedRacks.map((rack) => (
        <WheelRackMarker key={rack} rack={rack} />
      ))}
      {racks.map((rack) => (
        <FittingRack key={rack} rack={rack} />
      ))}
      <WheelHardpoints turrets={turret} launchers={launcher} />
      <FittingGauge resource="cpu" load="cpuLoad" output="cpuOutput" />
      <FittingGauge resource="powergrid" load="powerLoad" output="powerOutput" />
      <FittingGauge resource="calibration" load="upgradeLoad" output="upgradeCapacity" />
    </Wheel>
  );
}

function FittingRack({ rack }: { rack: WheelRack }) {
  const slots = useSlots(rack);
  const { total } = useRackUsage(rack);
  // EVE draws the high, medium and low slots a ship does not have as a faint outline; the others it leaves out.
  const shown = markedRacks.includes(rack as MarkedRack) ? rackSize(rack) : Math.min(slots.length, rackSize(rack));

  return Array.from({ length: shown }, (_, index) => (
    <FittingSlot key={index} rack={rack} index={index} content={slots[index]} available={index < total} />
  ));
}

interface FittingSlotProps {
  rack: WheelRack;
  index: number;
  content: SlotContent | undefined;
  available: boolean;
}

function FittingSlot({ rack, index, content, available }: FittingSlotProps) {
  const store = useFitStore();
  const item = content?.item;
  const stats = content?.stats;
  const type = useType(item?.type_id);
  const charges = useCharges(item?.type_id);
  const ref = content?.ref;

  const onPress: WheelSlotProps["onPress"] =
    ref !== undefined && stats !== undefined && switchedRacks.includes(rack)
      ? (event) => store.setState(ref, nextState(stats.state, stats.maxState, event.shiftKey))
      : undefined;

  return (
    <WheelSlot
      rack={rack}
      angle={slotAngle(rack, index)}
      available={available}
      typeId={item?.type_id}
      chargeTypeId={item?.charge?.type_id}
      chargeable={charges.length > 0}
      state={stats?.state}
      activatable={stats?.maxState === "active" || stats?.maxState === "overload"}
      label={type && stats && `${type.name}, ${stats.state}`}
      onPress={onPress}
    />
  );
}

interface FittingGaugeProps {
  resource: WheelResource;
  load: string;
  output: string;
}

function FittingGauge({ resource, load, output }: FittingGaugeProps) {
  // Nothing adds to a load the fit does not use, like calibration without rigs, so it is missing.
  const used = useAttribute(load).value ?? 0;
  const total = useAttribute(output);

  return (
    <WheelGauge
      resource={resource}
      used={used}
      total={total.value ?? 0}
      valueText={`${formatNumber(used)} / ${total.text}`}
    />
  );
}
