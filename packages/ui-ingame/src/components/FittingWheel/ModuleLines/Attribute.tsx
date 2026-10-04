import { useImages, useSde } from "@eveshipfit/react-hooks";
import type { ReactNode } from "react";

import styles from "../ModuleTooltip.module.css";

/** A tooltip line with an icon. */
function Line({
  src,
  className = styles.line,
  children,
}: {
  src: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={className}>
      <img src={src} width={24} height={24} alt="" draggable={false} />
      {children}
    </span>
  );
}

/** A tooltip line with the icon of an attribute. */
export function Attribute({ name, children }: { name: string; children: ReactNode }) {
  return <Line src={useAttributeIcon(name)}>{children}</Line>;
}

/** One value in a row of values, with the icon of its attribute. */
export function Bonus({ name, text }: { name: string; text: string }) {
  return (
    <Line src={useAttributeIcon(name)} className={styles.bonus}>
      {text}
    </Line>
  );
}

function useAttributeIcon(name: string) {
  const sde = useSde();
  const images = useImages();
  const id = sde.attributeId(name);
  return id === undefined ? undefined : images.attributeIcon(id);
}
