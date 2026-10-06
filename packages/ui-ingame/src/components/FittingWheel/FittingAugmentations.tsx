import type { Slot } from "@eveshipfit/fitting";
import {
  useBoosters,
  useDrag,
  useFitStore,
  useImplants,
  usePlacement,
  usePreview,
  useSde,
  useType,
  type DragItem,
  type SlotContent,
} from "@eveshipfit/react-hooks";

import type { Augmentation } from "../../primitives/Wheel/layout";
import { WheelAugmentationSlot } from "../../primitives/Wheel/WheelAugmentationSlot";
import { WheelAugmentationTrack } from "../../primitives/Wheel/WheelAugmentationTrack";
import { allowDrop } from "./fittingSlot";
import { TypeRow } from "./ModuleTooltip";
import styles from "./ModuleTooltip.module.css";

/** The implants and boosters of the fit, on tracks outside the wheel. */
export function FittingAugmentations({ readOnly }: { readOnly: boolean }) {
  const implants = useImplants();
  const boosters = useBoosters();
  const showImplants = !readOnly || implants.some((slot) => slot.item !== undefined);
  const boosterSlots: (SlotContent | undefined)[] = readOnly ? [...boosters] : [...boosters, undefined];

  return (
    <>
      {showImplants && (
        <>
          <WheelAugmentationTrack kind="implant" length={implants.length} />
          {implants.map((content, position) => (
            <FittingAugmentation
              key={content.index}
              kind="implant"
              position={position}
              number={content.index}
              content={content}
              readOnly={readOnly}
            />
          ))}
        </>
      )}
      {boosterSlots.length > 0 && (
        <>
          <WheelAugmentationTrack kind="booster" length={boosterSlots.length} />
          {boosterSlots.map((content, position) => (
            <FittingAugmentation
              key={content?.index ?? "empty"}
              kind="booster"
              position={position}
              content={content}
              readOnly={readOnly}
            />
          ))}
        </>
      )}
    </>
  );
}

interface FittingAugmentationProps {
  kind: Augmentation;
  position: number;
  /** The implant slot number. */
  number?: number;
  content: SlotContent | undefined;
  readOnly: boolean;
}

function FittingAugmentation({ kind, position, number, content, readOnly }: FittingAugmentationProps) {
  const store = useFitStore();
  const sde = useSde();
  const placement = usePlacement();
  const { show, clear } = usePreview();
  const { dragging, start, end } = useDrag();
  const item = content?.item;
  const type = useType(item?.type_id);
  const ref = content?.ref;

  const target = `${kind}-${content?.index ?? "empty"}`;
  const slot: Slot | undefined = number === undefined ? undefined : { type: kind, index: number };
  const takes = (drop: DragItem | undefined): drop is Extract<DragItem, { type: "type" }> => {
    if (drop?.type !== "type") return false;
    const dropped = sde.type(drop.typeId);
    const place = dropped && placement(dropped);
    return place?.type === kind && (number === undefined || place.index === number);
  };

  const tooltip = item && type && !content.preview && (
    <span className={styles.tooltip}>
      <TypeRow typeId={item.type_id} />
      <span className={styles.status}>{`${kind === "implant" ? "Implant" : "Booster"} Slot ${content.index}`}</span>
    </span>
  );
  const shown = {
    kind,
    position,
    number,
    typeId: item?.type_id,
    typeName: type?.name,
    preview: content?.preview,
    tooltip,
    "data-slot": slot === undefined ? undefined : `${kind}-${number}`,
  };
  if (readOnly) return <WheelAugmentationSlot {...shown} />;

  return (
    <WheelAugmentationSlot
      {...shown}
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
      onDragEnter={() => {
        if (!takes(dragging)) return;
        const { typeId } = dragging;
        show((draft) => void draft.fit(typeId, slot), target);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        clear(target);
      }}
      onDragOver={(event) => {
        if (takes(dragging)) allowDrop(event, dragging);
      }}
      onDrop={(event) => {
        if (!takes(dragging)) return;
        event.preventDefault();
        clear(target);
        store.fit(dragging.typeId, slot);
        end();
      }}
      onUnfit={ref === undefined ? undefined : () => store.remove(ref)}
    />
  );
}
