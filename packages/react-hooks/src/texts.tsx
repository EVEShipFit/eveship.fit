import type { Texts } from "@eveshipfit/sde-loader";
import type { ReactNode } from "react";

import { TextsContext } from "./context.js";

export interface TextsProviderProps {
  /** From `loadTexts` of `@eveshipfit/sde-loader`. */
  texts: Texts;
  children?: ReactNode;
}

export function TextsProvider({ texts, children }: TextsProviderProps) {
  return <TextsContext value={texts}>{children}</TextsContext>;
}
