import { useType } from "@eveshipfit/react-hooks";

import { EffectRange } from "./parts/EffectRange";
import type { LineProps } from "./index";

/** The range of the effect a module activates. */
export function ActivationRange({
  itemRef,
  typeId,
  label,
  falloffLabel,
}: LineProps & { label?: string; falloffLabel?: string }) {
  const effectId = useType(typeId)?.defaultEffectId;
  if (effectId === undefined) return null;
  return <EffectRange itemRef={itemRef} effectId={effectId} label={label} falloffLabel={falloffLabel} />;
}
