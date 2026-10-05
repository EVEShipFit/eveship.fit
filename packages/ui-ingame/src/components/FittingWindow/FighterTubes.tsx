import { baseValue, squadronSize, tubeTakes, type FighterKind } from "@eveshipfit/fitting";
import {
  useCanFit,
  useDrag,
  useFighterTubes,
  useFighterTubeUsage,
  useFitStore,
  usePreview,
  useSde,
  useSnapshot,
  useType,
  type SlotContent,
} from "@eveshipfit/react-hooks";

import { FighterTube } from "../../primitives/FighterTube/FighterTube";
import { Icon, type IconName } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import styles from "./BayContents.module.css";
import { FighterTooltip } from "./FighterTooltip";

/** EVE draws five, those the ship does not have faded. */
const FIGHTER_TUBES = 5;

const kinds: { kind: FighterKind; icon: IconName; label: string }[] = [
  { kind: "light", icon: "fighter-light", label: "Light Fighters" },
  { kind: "support", icon: "fighter-support", label: "Support Fighters" },
  { kind: "heavy", icon: "fighter-heavy", label: "Heavy Fighters" },
];

/** By `fighterSquadronRole`. */
const roles: Record<number, IconName> = {
  1: "fighter-role-interceptor",
  2: "fighter-role-attack",
  3: "fighter-role-support",
  4: "fighter-role-heavy-attack",
  5: "fighter-role-bomber",
};

/** The squadrons launched by kind, and EVE's row of fighter tubes. */
export function FighterTubes() {
  const tubes = useFighterTubes();
  const usage = useFighterTubeUsage();

  return (
    <>
      <div className={styles.kinds}>
        {kinds
          .filter(({ kind }) => usage[kind].total > 0)
          .map(({ kind, icon, label }) => (
            <Tooltip key={kind} label={label}>
              <span className={styles.kind} aria-label={`${label}: ${usage[kind].used} of ${usage[kind].total}`}>
                <Icon name={icon} />:{usage[kind].used}/{usage[kind].total}
              </span>
            </Tooltip>
          ))}
      </div>
      <div
        className={styles.tubes}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- A <fieldset> is for form controls.
        role="group"
        aria-label="Fighter Tubes"
      >
        {Array.from({ length: Math.max(FIGHTER_TUBES, tubes.length) }, (_, index) => (
          <LaunchTube key={index} index={index} content={tubes[index]} available={index < usage.all.total} />
        ))}
      </div>
    </>
  );
}

function LaunchTube({ index, content, available }: { index: number; content?: SlotContent; available: boolean }) {
  const store = useFitStore();
  const sde = useSde();
  const { fit, stats } = useSnapshot();
  const canFit = useCanFit();
  const { dragging, start, end } = useDrag();
  const { show, clear } = usePreview();
  const item = content?.item;
  const type = useType(item?.type_id);
  const ref = content?.ref;

  const dropped = dragging?.type === "type" ? sde.type(dragging.typeId) : undefined;
  const taken =
    available && dropped !== undefined && canFit(dropped) && tubeTakes(sde, fit, stats, dropped, index)
      ? dropped
      : undefined;
  const slot = { type: "fighter_tube", index } as const;
  const moved = dragging?.type === "item" ? fit.items[dragging.ref] : undefined;
  const movedRef =
    available && dragging?.type === "item" && moved?.slot.type === "fighter_tube" && moved.slot.index !== index
      ? dragging.ref
      : undefined;
  const target = `fighter-tube-${index}`;
  const role = type && baseValue(sde, type, "fighterSquadronRole");

  return (
    <FighterTube
      index={index}
      available={available}
      preview={content?.preview}
      typeId={item?.type_id}
      typeName={type?.name}
      quantity={item?.quantity ?? 1}
      size={type && squadronSize(sde, type)}
      role={role === undefined ? undefined : roles[role]}
      tooltip={
        ref === undefined || item === undefined || content?.preview ? undefined : (
          <FighterTooltip itemRef={ref} typeId={item.type_id} quantity={item.quantity ?? 1} />
        )
      }
      onRemove={ref === undefined ? undefined : () => store.remove(ref)}
      onResize={ref === undefined ? undefined : (quantity) => store.setSquadronSize(ref, quantity)}
      draggable={ref !== undefined && !content?.preview}
      onDragStart={(event) => {
        if (ref === undefined) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", type?.name ?? "");
        start({ type: "item", ref });
      }}
      onDragEnd={end}
      onDragEnter={() => {
        if (taken) show((draft) => void draft.fit(taken.id, slot), target);
        if (movedRef !== undefined) show((draft) => draft.move(movedRef, slot), target);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        clear(target);
      }}
      onDragOver={(event) => {
        if (!taken && movedRef === undefined) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = taken ? "copy" : "move";
      }}
      onDrop={(event) => {
        if (!taken && movedRef === undefined) return;
        event.preventDefault();
        clear(target);
        if (taken) store.fit(taken.id, slot);
        else store.move(movedRef!, slot);
        end();
      }}
    />
  );
}
