import type { Fit, FitStore, Preview, Snapshot, Stats, Violation } from "@eveshipfit/fitting";
import { useSyncExternalStore } from "react";

import { FitContext, PreviewContext, useRequiredContext } from "../context.js";

/** The store behind the current fit, for making changes to it. */
export function useFitStore(): FitStore {
  return useRequiredContext(FitContext);
}

/** Throws while the store has no fit; see `useHasFit`. */
export function useSnapshot(): Snapshot {
  const snapshot = useSnapshotIfAny();
  if (snapshot === undefined) throw new Error("There is no fit yet; check `useHasFit` first");
  return snapshot;
}

export function useHasFit(): boolean {
  return useSnapshotIfAny() !== undefined;
}

/** Undefined while the store has no fit. */
export function useSnapshotIfAny(): Snapshot | undefined {
  const store = useFitStore();
  return useSyncExternalStore(store.subscribe, () => (store.hasFit ? store.getSnapshot() : undefined));
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
  /** Show what `edit` would do, until `clear` or the next change to the fit; `target` names the drop target showing it. */
  readonly show: (edit: (fit: FitStore) => void, target?: string) => void;
  /** With `target`, only when that target showed the preview. */
  readonly clear: (target?: string) => void;
}

/** Shows nothing while the store has no fit. */
export function usePreview(): PreviewControls {
  const store = useFitStore();
  const snapshot = useSnapshotIfAny();
  const { preview, show, clear } = useRequiredContext(PreviewContext);

  return {
    preview: snapshot !== undefined && preview?.before === snapshot ? preview : undefined,
    show: (edit, target) => {
      if (store.hasFit) show(store.preview(edit), target);
    },
    clear: (target) => clear(target),
  };
}

export interface FitHistory {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly length: number;
  /** 0 is the oldest. */
  readonly position: number;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly goTo: (position: number) => void;
}

export function useFitHistory(): FitHistory {
  const store = useFitStore();
  // Re-render on every change, as the history follows the snapshot.
  useSnapshot();

  return {
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    length: store.historyLength,
    position: store.historyPosition,
    undo: () => store.undo(),
    redo: () => store.redo(),
    goTo: (position) => store.goTo(position),
  };
}

/** Follows the preview, like `useStats`. */
export function useViolations(): readonly Violation[] {
  return useStats().violations;
}

/** The snapshot of the preview if there is one, else the current one. */
export function useShownSnapshot(): Snapshot {
  const snapshot = useSnapshot();
  const { preview } = useRequiredContext(PreviewContext);
  // A preview of an older snapshot is stale: the fit changed underneath it.
  return preview?.before === snapshot ? preview.after : snapshot;
}
