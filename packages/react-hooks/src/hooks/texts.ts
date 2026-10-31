import type { SdeTooltip, SdeTypeBonuses, Texts } from "@eveshipfit/sde-loader";

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

/** The bonuses EVE shows when hovering a ship; most types have none. */
export function useTypeBonuses(typeId: number | undefined): SdeTypeBonuses | undefined {
  const texts = useTexts();
  return typeId === undefined ? undefined : texts.typeBonuses(typeId);
}
