import type { Slot } from "@eveshipfit/fitting";

import { MutateContext, useRequiredContext, type InfoAnchor, type ShownMutation } from "../context.js";

export interface Mutate {
  readonly shown: ShownMutation | undefined;
  readonly show: (slot: Slot, anchor?: InfoAnchor) => void;
  readonly close: () => void;
}

/** Opens and closes the window to mutate a fitted module in. */
export function useMutate(): Mutate {
  const { shown, setShown } = useRequiredContext(MutateContext);
  return { shown, show: (slot, anchor) => setShown({ slot, anchor }), close: () => setShown(undefined) };
}
