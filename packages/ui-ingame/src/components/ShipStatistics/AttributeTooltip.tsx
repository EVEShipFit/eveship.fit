import { useAttributeTooltip, useSde } from "@eveshipfit/react-hooks";

import { TooltipText } from "../../primitives/Tooltip/Tooltip";

/** What EVE shows when hovering the attribute; its name, for one without. */
export function AttributeTooltip({ attribute }: { attribute: string }) {
  const sde = useSde();
  const tooltip = useAttributeTooltip(attribute);
  const title = tooltip?.title ?? sde.attribute(sde.attributeId(attribute) ?? 0)?.displayName ?? attribute;
  return <TooltipText title={title} description={tooltip?.description} />;
}
