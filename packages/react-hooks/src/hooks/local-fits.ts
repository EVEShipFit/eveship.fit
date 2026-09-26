import type { Fit } from "@eveshipfit/fitting";
import { useSyncExternalStore } from "react";

import { LocalFitsContext, useRequiredContext } from "../context.js";

export interface LocalFitsControls {
  readonly fits: readonly Fit[];
  readonly save: (fit: Fit) => void;
  readonly remove: (fit: Fit) => void;
}

export function useLocalFits(): LocalFitsControls {
  const localFits = useRequiredContext(LocalFitsContext);
  const fits = useSyncExternalStore(localFits.subscribe, localFits.list);

  return {
    fits,
    save: (fit) => localFits.save(fit),
    remove: (fit) => localFits.remove(fit),
  };
}
