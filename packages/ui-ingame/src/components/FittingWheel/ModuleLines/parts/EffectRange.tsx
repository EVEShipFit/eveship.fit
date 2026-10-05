import type { ItemRef } from "@eveshipfit/fitting";
import { useSde } from "@eveshipfit/react-hooks";

import { range } from "../../../ShipStatistics/units";
import { Range } from "./Range";

/** The range of an effect, by the attributes the effect names for it. */
export function EffectRange({ itemRef, effectId, label }: { itemRef: ItemRef; effectId: number; label: string }) {
  const sde = useSde();
  const effect = sde.effect(effectId);
  const optimal = sde.attribute(effect?.rangeAttributeId ?? 0)?.name;
  if (optimal === undefined) return null;
  const falloff = sde.attribute(effect?.falloffAttributeId ?? 0)?.name;

  return (
    <Range
      itemRef={itemRef}
      optimal={optimal}
      falloff={falloff}
      label={label}
      falloffLabel="Falloff range"
      format={range}
    />
  );
}
