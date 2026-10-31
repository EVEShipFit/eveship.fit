import { RefusalContext, useRequiredContext, type Refusal } from "../context.js";

export interface Refuse {
  /** The latest refusal; a new object each time, also for the same type. */
  readonly refusal: Refusal | undefined;
  /** Tells that the fit refused to take a type. */
  readonly refuse: (typeId: number) => void;
}

export function useRefusal(): Refuse {
  const { refusal, setRefusal } = useRequiredContext(RefusalContext);
  return { refusal, refuse: (typeId) => setRefusal({ typeId }) };
}
