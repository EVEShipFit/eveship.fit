import { useEngine, useFit } from "@eveshipfit/react-hooks";
import { useMemo } from "react";

/** The eveship.fit link that opens the current fit. */
export function useFitLink(): string {
  const engine = useEngine();
  const fit = useFit();
  return useMemo(() => `https://eveship.fit/?fit=${engine.saveLink(fit)}`, [engine, fit]);
}
