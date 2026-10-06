import type { ItemRef } from "@eveshipfit/fitting";

import { AttributeLine, nameFirst } from "./Attribute";

/** "Turret Tracking: 0.36"; nothing without tracking. */
export function Tracking({ itemRef }: { itemRef: ItemRef }) {
  return <AttributeLine itemRef={itemRef} name="trackingSpeed" decimals={2} fixed layout={nameFirst} hideZero />;
}
