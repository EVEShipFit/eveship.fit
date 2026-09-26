import { DragContext, useRequiredContext, type DragItem } from "../context.js";

export interface Drag {
  /** What is being dragged, so drop targets can tell whether they take it. */
  readonly dragging: DragItem | undefined;
  readonly start: (item: DragItem) => void;
  readonly end: () => void;
}

export function useDrag(): Drag {
  const { dragging, setDragging } = useRequiredContext(DragContext);
  return {
    dragging,
    start: (item) => setDragging(item),
    end: () => setDragging(undefined),
  };
}
