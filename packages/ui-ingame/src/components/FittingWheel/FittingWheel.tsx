import type { FitStore } from "@eveshipfit/fitting";
import {
  formatNumber,
  useAttribute,
  useDrag,
  useFit,
  useFitStore,
  useHardpoints,
  usePreview,
  useRackUsage,
  useSlots,
  type DragItem,
  type SlotContent,
} from "@eveshipfit/react-hooks";

import { rackSize, slotAngle, type WheelRack } from "../../primitives/Wheel/layout";
import { Wheel } from "../../primitives/Wheel/Wheel";
import { WheelGauge, type WheelResource } from "../../primitives/Wheel/WheelGauge";
import { WheelHardpoints } from "../../primitives/Wheel/WheelHardpoints";
import { WheelHull } from "../../primitives/Wheel/WheelHull";
import { WheelRackMarker, type MarkedRack } from "../../primitives/Wheel/WheelRackMarker";
import { WheelSlot } from "../../primitives/Wheel/WheelSlot";
import { allowDrop, useFittingSlot } from "./fittingSlot";
import styles from "./FittingWheel.module.css";

const markedRacks: MarkedRack[] = ["high", "medium", "low"];
const racks: WheelRack[] = ["high", "medium", "low", "rig", "subsystem"];

export interface FittingWheelProps {
  label?: string;
  /** Shows the fit without letting it be changed. */
  readOnly?: boolean;
}

/** The fitting wheel of the fit in the surrounding `EveShipFitProvider`. */
export function FittingWheel({ label = "Fitting", readOnly = false }: FittingWheelProps) {
  const ship = useFit().ship.type_id;
  const { turret, launcher } = useHardpoints();

  return (
    <Wheel label={label}>
      <WheelHull typeId={ship} />
      {!readOnly && <FittingCentre />}
      {markedRacks.map((rack) => (
        <WheelRackMarker key={rack} rack={rack} />
      ))}
      {racks.map((rack) => (
        <FittingRack key={rack} rack={rack} readOnly={readOnly} />
      ))}
      <WheelHardpoints turrets={turret} launchers={launcher} />
      <FittingGauge resource="cpu" load="cpuLoad" output="cpuOutput" />
      <FittingGauge resource="powergrid" load="powerLoad" output="powerOutput" />
      <FittingGauge resource="calibration" load="upgradeLoad" output="upgradeCapacity" />
    </Wheel>
  );
}

function FittingRack({ rack, readOnly }: { rack: WheelRack; readOnly: boolean }) {
  const slots = useSlots(rack);
  const { total } = useRackUsage(rack);
  // EVE draws the high, medium and low slots a ship does not have as a faint outline; the others it leaves out.
  const shown = markedRacks.includes(rack as MarkedRack) ? rackSize(rack) : Math.min(slots.length, rackSize(rack));

  return Array.from({ length: shown }, (_, index) => (
    <FittingSlot
      key={index}
      rack={rack}
      index={index}
      content={slots[index]}
      available={index < total}
      readOnly={readOnly}
    />
  ));
}

/** Fits a type dropped in the middle of the wheel, and unfits a fitted item. */
function FittingCentre() {
  const store = useFitStore();
  const fit = useFit();
  const { show, clear } = usePreview();
  const { dragging, end } = useDrag();
  const fits = dragging?.type === "type" && placesSomewhere(store, dragging.typeId);
  const takes = (item: DragItem | undefined): item is DragItem => {
    if (item === undefined) return false;
    if (item.type === "item") return fit.items[item.ref] !== undefined;
    return item.type === "hull" || fits;
  };

  return (
    <div
      className={styles.centre}
      data-centre
      onDragEnter={() => {
        if (dragging?.type !== "type") return;
        const { typeId } = dragging;
        show((draft) => void draft.fit(typeId), "centre");
      }}
      onDragLeave={() => clear("centre")}
      onDragOver={(event) => {
        if (takes(dragging)) allowDrop(event, dragging);
      }}
      onDrop={(event) => {
        if (!takes(dragging)) return;
        event.preventDefault();
        clear("centre");
        if (dragging.type === "type") store.fit(dragging.typeId);
        else if (dragging.type === "hull") store.replace({ ship: { type_id: dragging.typeId }, items: [] });
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
  readOnly: boolean;
}

function FittingSlot({ rack, index, content, available, readOnly }: FittingSlotProps) {
  const slot = useFittingSlot(rack, index, content, available, readOnly);
  return <WheelSlot rack={rack} angle={slotAngle(rack, index)} {...slot} />;
}

function placesSomewhere(store: FitStore, typeId: number): boolean {
  let placed = false;
  store.preview((draft) => {
    placed = draft.fit(typeId) !== undefined;
  });
  return placed;
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
