import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute } from "@eveshipfit/react-hooks";

import { Attribute, useDisplayName } from "./Attribute";

/** "Turret Tracking: 0.36"; nothing without tracking. */
export function Tracking({ itemRef }: { itemRef: ItemRef }) {
  const tracking = useAttribute("trackingSpeed", { of: itemRef, decimals: 2, fixed: true });
  const displayName = useDisplayName("trackingSpeed");
  if (!tracking.value) return null;
  return (
    <Attribute name="trackingSpeed">
      {displayName}: {tracking.text}
    </Attribute>
  );
}
