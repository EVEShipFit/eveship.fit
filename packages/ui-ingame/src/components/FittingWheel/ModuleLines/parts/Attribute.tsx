import type { ItemRef } from "@eveshipfit/fitting";
import { useAttribute, useImages, useSde, type AttributeOptions } from "@eveshipfit/react-hooks";
import type { ReactNode } from "react";

import styles from "../../ModuleTooltip.module.css";

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
      {src === undefined ? (
        <span className={styles.noIcon} />
      ) : (
        <img src={src} width={24} height={24} alt="" draggable={false} />
      )}
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

/** How a line puts an attribute's value and name together. */
export type Layout = (text: string, displayName: string | undefined) => string;

const valueFirst: Layout = (text, displayName) => `${text} ${displayName}`;

/** Like "Turret Tracking: 0.36". */
export const nameFirst: Layout = (text, displayName) => `${displayName}: ${text}`;

/** An attribute of an item with its name, like "-17% Falloff Bonus"; nothing without a value. */
export function AttributeLine({
  itemRef,
  name,
  hideZero = false,
  layout = valueFirst,
  ...options
}: Omit<AttributeOptions, "of"> & { itemRef: ItemRef; name: string; hideZero?: boolean; layout?: Layout }) {
  const { value, text } = useAttribute(name, { of: itemRef, ...options });
  const displayName = useDisplayName(name);
  if (value === undefined || (hideZero && !value)) return null;
  return <Attribute name={name}>{layout(text, displayName)}</Attribute>;
}

function useAttributeIcon(name: string) {
  const sde = useSde();
  const images = useImages();
  const id = sde.attributeId(name);
  return id === undefined ? undefined : images.attributeIcon(id);
}

/** The name EVE shows for an attribute. */
export function useDisplayName(name: string) {
  const sde = useSde();
  return sde.attribute(sde.attributeId(name) ?? 0)?.displayName;
}
