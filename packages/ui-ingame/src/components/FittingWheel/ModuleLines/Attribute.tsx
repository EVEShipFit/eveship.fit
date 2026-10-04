import { useImages, useSde } from "@eveshipfit/react-hooks";
import type { ReactNode } from "react";

import styles from "../ModuleTooltip.module.css";

/** A tooltip line with an icon. */
export function Line({ src, children }: { src: string | undefined; children: ReactNode }) {
  return (
    <span className={styles.line}>
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
    <span className={styles.bonus}>
      <img src={useAttributeIcon(name)} width={24} height={24} alt="" draggable={false} />
      {text}
    </span>
  );
}

function useAttributeIcon(name: string) {
  const sde = useSde();
  const images = useImages();
  const id = sde.attributeId(name);
  return id === undefined ? undefined : images.attributeIcon(id);
}
