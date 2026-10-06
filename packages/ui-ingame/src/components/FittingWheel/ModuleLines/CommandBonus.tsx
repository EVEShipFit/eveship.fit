import { useAttribute } from "@eveshipfit/react-hooks";

import { unit } from "../../ShipStatistics/units";
import { Attribute } from "./parts/Attribute";
import type { LineProps } from "./index";

export function CommandBonus({ itemRef }: LineProps) {
  const bonus = useAttribute("commandBonus", { of: itemRef, decimals: 2, fixed: true, format: unit("%") });
  if (bonus.value === undefined) return null;
  return <Attribute name="commandBonus">Command Bonus: {bonus.text}</Attribute>;
}
