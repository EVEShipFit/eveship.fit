import { useAttribute } from "@eveshipfit/react-hooks";

import { ActivationRange } from "./ActivationRange";
import { Attribute } from "./parts/Attribute";
import { percent } from "./parts/Bonus";
import type { LineProps } from "./index";

export function StasisWebifier(props: LineProps) {
  const reduction = useAttribute("speedFactor", {
    of: props.itemRef,
    decimals: 0,
    format: (value, format) => percent(-value, format),
  });
  return (
    <>
      <ActivationRange {...props} />
      <Attribute name="speedFactor">Reduces target ship's velocity by {reduction.text}</Attribute>
    </>
  );
}
