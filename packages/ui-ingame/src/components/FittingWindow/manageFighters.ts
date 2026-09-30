import { createContext, useContext } from "react";

/** Opens the fighter bay of the `FittingWindow` around it. */
export const ManageFightersContext = createContext<(() => void) | undefined>(undefined);

export function useManageFighters(): (() => void) | undefined {
  return useContext(ManageFightersContext);
}
