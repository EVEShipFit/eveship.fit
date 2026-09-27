import type { Fit, ItemRef } from "@eveshipfit/fitting";
import {
  formatNumber,
  useAttribute,
  useCharges,
  useDrag,
  useFit,
  useFitStore,
  useHardpoints,
  usePlacement,
  useRackUsage,
  useSde,
  useSlots,
  useType,
  type DragItem,
  type SlotContent,
} from "@eveshipfit/react-hooks";
import type { DragEvent } from "react";

import { rackSize, slotAngle, type WheelRack } from "../../primitives/Wheel/layout";
import { Wheel } from "../../primitives/Wheel/Wheel";
import { WheelGauge, type WheelResource } from "../../primitives/Wheel/WheelGauge";
import { WheelHardpoints } from "../../primitives/Wheel/WheelHardpoints";
import { WheelHull } from "../../primitives/Wheel/WheelHull";
import { WheelRackMarker, type MarkedRack } from "../../primitives/Wheel/WheelRackMarker";
import { WheelSlot, type WheelSlotProps } from "../../primitives/Wheel/WheelSlot";
import styles from "./FittingWheel.module.css";
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
      <FittingCentre />
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

/** Fits a type dropped in the middle of the wheel, and unfits a fitted item. */
function FittingCentre() {
  const store = useFitStore();
  const fit = useFit();
  const { dragging, end } = useDrag();
  const takes = (item: DragItem | undefined): item is DragItem =>
    item !== undefined && (item.type === "type" || fit.items[item.ref] !== undefined);

  return (
    <div
      className={styles.centre}
      data-centre
      onDragOver={(event) => {
        if (takes(dragging)) allowDrop(event, dragging);
      }}
      onDrop={(event) => {
        if (!takes(dragging)) return;
        event.preventDefault();
        if (dragging.type === "type") store.fit(dragging.typeId);
        else store.remove(dragging.ref);
        end();
      }}
    />
  );
}

interface FittingSlotProps {
  rack: WheelRack;
  index: number;
  content: SlotContent | undefined;
  available: boolean;
}

function FittingSlot({ rack, index, content, available }: FittingSlotProps) {
  const store = useFitStore();
  const sde = useSde();
  const fit = useFit();
  const placement = usePlacement();
  const { dragging, start, end } = useDrag();
  const item = content?.item;
  const stats = content?.stats;
  const type = useType(item?.type_id);
  const charges = useCharges(item?.type_id);
  const ref = content?.ref;

  const switchable = ref !== undefined && stats !== undefined && switchedRacks.includes(rack);

  const takes = (drop: DragItem | undefined): drop is DragItem => {
    if (!available || drop === undefined) return false;
    if (drop.type === "item") return movesTo(fit, drop.ref, rack, index);
    const dropped = sde.type(drop.typeId);
    const place = dropped && placement(dropped);
    return place?.type === rack && (place.type !== "subsystem" || place.index === index);
  };

  const onPress: WheelSlotProps["onPress"] = switchable
    ? (event) => store.setState(ref, nextState(stats.state, stats.maxState, event.shiftKey))
    : undefined;

  return (
    <WheelSlot
      rack={rack}
      angle={slotAngle(rack, index)}
      available={available}
      preview={content?.preview}
      typeId={item?.type_id}
      typeName={type?.name}
      chargeTypeId={item?.charge?.type_id}
      chargeable={charges.length > 0}
      state={stats?.state}
      activatable={stats?.maxState === "active" || stats?.maxState === "overload"}
      label={type && stats && `${type.name}, ${stats.state}`}
      onPress={onPress}
      onDragStart={
        ref === undefined
          ? undefined
          : (event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", type?.name ?? "");
              start({ type: "item", ref });
            }
      }
      onDragEnd={end}
      onDragOver={(event) => {
        if (takes(dragging)) allowDrop(event, dragging);
      }}
      onDrop={(event) => {
        if (!takes(dragging)) return;
        event.preventDefault();
        if (dragging.type === "type") store.fit(dragging.typeId, { type: rack, index });
        else store.move(dragging.ref, { type: rack, index });
        end();
      }}
      onUnfit={ref === undefined ? undefined : () => store.remove(ref)}
      onRemoveCharge={ref === undefined ? undefined : () => store.setCharge(ref, undefined)}
      onTogglePower={
        switchable && stats.maxState !== "offline"
          ? () => store.setState(ref, stats.state === "offline" ? "online" : "offline")
          : undefined
      }
    />
  );
}

/** Whether a fitted item can move to this slot. */
function movesTo(fit: Fit, ref: ItemRef, rack: WheelRack, index: number): boolean {
  const item = fit.items[ref];
  if (item === undefined || rack === "subsystem" || item.slot.type !== rack) return false;
  return "index" in item.slot && item.slot.index !== index;
}

function allowDrop(event: DragEvent, dragging: DragItem) {
  event.preventDefault();
  event.dataTransfer.dropEffect = dragging.type === "type" ? "copy" : "move";
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
