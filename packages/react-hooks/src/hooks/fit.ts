import type { Fit, FitStore, Preview, Snapshot, Stats } from "@eveshipfit/fitting";
import { useSyncExternalStore } from "react";

import { FitContext, PreviewContext, useRequiredContext } from "../context.js";

/** The store behind the current fit, for making changes to it. */
export function useFitStore(): FitStore {
  return useRequiredContext(FitContext);
}

export function useSnapshot(): Snapshot {
  const store = useFitStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useFit(): Fit {
  return useSnapshot().fit;
}

/** The stats to show: those of the preview while there is one, otherwise the fit's own. */
export function useStats(): Stats {
  return useShownSnapshot().stats;
}

export interface PreviewControls {
  readonly preview: Preview | undefined;
  /** Show what `edit` would do, until `clear` or the next change to the fit. */
  readonly show: (edit: (fit: FitStore) => void) => void;
  readonly clear: () => void;
}

export function usePreview(): PreviewControls {
  const store = useFitStore();
  const snapshot = useSnapshot();
  const { preview, setPreview } = useRequiredContext(PreviewContext);

  return {
    preview: preview?.before === snapshot ? preview : undefined,
    show: (edit) => setPreview(store.preview(edit)),
    clear: () => setPreview(undefined),
  };
}

export interface FitHistory {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undo: () => void;
  readonly redo: () => void;
}

export function useFitHistory(): FitHistory {
  const store = useFitStore();
  // Re-render on every change, as `canUndo` and `canRedo` follow the snapshot.
  useSnapshot();

  return {
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    undo: () => store.undo(),
    redo: () => store.redo(),
  };
}

/** The snapshot of the preview if there is one, else the current one. */
function useShownSnapshot(): Snapshot {
  const snapshot = useSnapshot();
  const { preview } = useRequiredContext(PreviewContext);
  // A preview of an older snapshot is stale: the fit changed underneath it.
  return preview?.before === snapshot ? preview.after : snapshot;
}
