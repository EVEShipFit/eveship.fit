import type { SdeTooltip, Texts } from "@eveshipfit/sde-loader";

import { TextsContext, useRequiredContext } from "../context.js";
import { useSde } from "./sde.js";

export function useTexts(): Texts {
  return useRequiredContext(TextsContext, "TextsProvider");
}

/** What EVE shows when hovering the attribute; most attributes have none. */
export function useAttributeTooltip(name: string): SdeTooltip | undefined {
  const sde = useSde();
  const texts = useTexts();
  const id = sde.attributeId(name);
  return id === undefined ? undefined : texts.attributeTooltip(id);
}
