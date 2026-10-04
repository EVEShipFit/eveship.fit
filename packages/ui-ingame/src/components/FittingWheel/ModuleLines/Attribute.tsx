import { useImages, useSde } from "@eveshipfit/react-hooks";
import type { ReactNode } from "react";

import styles from "../ModuleTooltip.module.css";

/** A tooltip line with the icon of an attribute. */
export function Attribute({ name, children }: { name: string; children: ReactNode }) {
  const sde = useSde();
  const images = useImages();
  const id = sde.attributeId(name);
  return (
    <span className={styles.line}>
      <img
        src={id === undefined ? undefined : images.attributeIcon(id)}
        width={24}
        height={24}
        alt=""
        draggable={false}
      />
      {children}
    </span>
  );
}
