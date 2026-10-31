import { RefusalContext, useRequiredContext, type Refusal } from "../context.js";

export interface Refuse {
  /** The latest refusal; a new object each time, also for the same type. */
  readonly refusal: Refusal | undefined;
  /** Tells that the fit refused a type, for a moment. */
  readonly refuse: (typeId: number) => void;
  /** Tells that the fit refuses a type, until `release`. */
  readonly hold: (typeId: number) => void;
  readonly release: () => void;
}

export function useRefusal(): Refuse {
  const { refusal, setRefusal } = useRequiredContext(RefusalContext);
  return {
    refusal,
    refuse: (typeId) =>
      setRefusal((current) => (current?.held && current.typeId === typeId ? current : { typeId, held: false })),
    hold: (typeId) => setRefusal({ typeId, held: true }),
    release: () => setRefusal((current) => (current?.held ? undefined : current)),
  };
}
