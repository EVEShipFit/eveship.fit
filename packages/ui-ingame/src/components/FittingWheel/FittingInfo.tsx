import type { Slot } from "@eveshipfit/fitting";
import { useImages, useInfo, useShowInfo, type InfoTarget } from "@eveshipfit/react-hooks";
import { useEffect } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./FittingInfo.module.css";

const slotNames: Partial<Record<Slot["type"], string>> = {
  high: "High Slot",
  medium: "Mid Slot",
  low: "Low Slot",
  rig: "Rig Slot",
  subsystem: "Subsystem Slot",
  service: "Service Slot",
  drone_bay: "Drone Bay",
  fighter_bay: "Fighter Bay",
  fighter_tube: "Fighter Tube",
  implant: "Implant Slot",
  booster: "Booster Slot",
  cargo: "Cargo",
};

/** EVE's Show Info in the middle of the wheel, of what `useShowInfo` shows. */
export function FittingInfo() {
  const { shown, close } = useShowInfo();

  useEffect(() => {
    if (shown === undefined) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shown, close]);

  if (shown === undefined) return null;
  return <InfoCard target={shown} onClose={close} />;
}

function InfoCard({ target, onClose }: { target: InfoTarget; onClose: () => void }) {
  const images = useImages();
  const { type, fitted, attributes } = useInfo(target);

  return (
    <section className={styles.card} aria-label={`Info on ${type?.name ?? ""}`}>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <Icon name="close" />
      </button>
      <header className={styles.header}>
        <TypeIcon typeId={target.typeId} size={48} />
        <div className={styles.title}>
          <h2 className={styles.name}>{type?.name}</h2>
          <span className={styles.where}>
            {fitted === undefined ? "Not fitted" : `${fitted.charge ? "Loaded" : "Fitted"} · ${slotName(fitted.slot)}`}
          </span>
        </div>
      </header>
      <dl className={styles.attributes}>
        {attributes.map((attribute) => {
          const icon = images.attributeIcon(attribute.id);
          return (
            <div key={attribute.id} className={styles.row}>
              <dt>
                {icon === undefined ? (
                  <span className={styles.icon} />
                ) : (
                  <img className={styles.icon} src={icon} alt="" />
                )}
                <span>{attribute.name}</span>
              </dt>
              <dd data-change={attribute.change}>{attribute.text}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function slotName(slot: Slot): string {
  const name = slotNames[slot.type] ?? slot.type;
  return "index" in slot ? `${name} ${slot.index + 1}` : name;
}
