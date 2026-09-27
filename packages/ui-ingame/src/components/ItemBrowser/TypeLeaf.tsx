import { useDrag, useFitStore, useImages, usePreview } from "@eveshipfit/react-hooks";
import type { MetaFolder, MetaSortedTypes, SdeType } from "@eveshipfit/sde-loader";
import { useRef, useState, type DragEvent, type ReactNode } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { Tooltip } from "../../primitives/Tooltip/Tooltip";
import { TreeGroup, TreeLeaf } from "../../primitives/TreeList/TreeList";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./ItemBrowser.module.css";

const folders: Record<MetaFolder, { label: string; metaGroupId: number }> = {
  faction: { label: "Faction & Storyline", metaGroupId: 4 },
  officer: { label: "Officer", metaGroupId: 5 },
  deadspace: { label: "Deadspace", metaGroupId: 6 },
};

export interface TypeActions {
  fit: (typeId: number) => void;
  hover: (typeId: number, hovering: boolean) => void;
  drag: (event: DragEvent, type: SdeType) => void;
  dragEnd: () => void;
}

/** Previews a type on hover, fits it on double click, and drags it to the wheel; render `dragImage` once. */
export function useTypeActions(): { actions: TypeActions; clear: () => void; dragImage: ReactNode } {
  const store = useFitStore();
  const { show, clear } = usePreview();
  const { start, end } = useDrag();
  const [hovered, setHovered] = useState<number>();
  const dragImage = useRef<HTMLSpanElement>(null);

  const actions: TypeActions = {
    fit: (typeId) => void store.fit(typeId),
    hover: (typeId, hovering) => {
      if (hovering) {
        setHovered(typeId);
        show((draft) => void draft.fit(typeId));
      } else clear();
    },
    drag: (event, type) => {
      clear();
      const image = dragImage.current;
      if (image?.dataset.typeId === String(type.id)) event.dataTransfer.setDragImage(image, 32, 32);
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", type.name);
      start({ type: "type", typeId: type.id });
    },
    dragEnd: () => {
      end();
      clear();
    },
  };

  return {
    actions,
    clear,
    dragImage: hovered !== undefined && (
      <span ref={dragImage} className={styles.dragImage} data-type-id={hovered} aria-hidden>
        <TypeIcon typeId={hovered} size={64} loading="eager" />
      </span>
    ),
  };
}

export interface TypeLeafProps {
  type: SdeType;
  actions: TypeActions;
  /** Shows the type's icon in front of its name. */
  icon?: boolean;
}

export function TypeLeaf({ type, actions, icon = false }: TypeLeafProps) {
  return (
    <TreeLeaf
      label={type.name}
      typeId={icon ? type.id : undefined}
      onActivate={() => actions.fit(type.id)}
      onHover={(hovering) => actions.hover(type.id, hovering)}
      onDragStart={(event) => actions.drag(event, type)}
      onDragEnd={actions.dragEnd}
      after={
        <Tooltip label="Show Info (not implemented yet)">
          <button
            type="button"
            className={styles.info}
            aria-label={`Show Info on ${type.name}`}
            aria-disabled
            tabIndex={-1}
          >
            <Icon name="module-info" />
          </button>
        </Tooltip>
      }
    />
  );
}

export interface TypeLeavesProps {
  sorted: MetaSortedTypes;
  open: boolean;
  actions: TypeActions;
  icon?: boolean;
}

/** The types, then their faction, officer and deadspace folders. */
export function TypeLeaves({ sorted, open, actions, icon }: TypeLeavesProps) {
  const images = useImages();

  return (
    <>
      {sorted.types.map((type) => (
        <TypeLeaf key={type.id} type={type} actions={actions} icon={icon} />
      ))}
      {sorted.folders.map(({ folder, types }) => (
        <TreeGroup
          key={folder}
          label={folders[folder].label}
          icon={images.metaGroupIcon(folders[folder].metaGroupId)}
          defaultOpen={open}
        >
          {() => types.map((type) => <TypeLeaf key={type.id} type={type} actions={actions} icon={icon} />)}
        </TreeGroup>
      ))}
    </>
  );
}

export function countLeaves(sorted: MetaSortedTypes): number {
  return sorted.folders.reduce((count, folder) => count + folder.types.length, sorted.types.length);
}
