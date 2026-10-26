import type { Slot } from "@eveshipfit/fitting";
import { formatNumber, useImages, useInfo, useShowInfo, useTypePrice, type ShownInfo } from "@eveshipfit/react-hooks";
import { useEffect, useId, useLayoutEffect, useRef, type CSSProperties } from "react";

import { Icon } from "../../primitives/Icon/Icon";
import { TypeIcon } from "../../primitives/TypeIcon/TypeIcon";
import styles from "./ItemInfo.module.css";

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

/** EVE's Show Info of what `useShowInfo` shows, next to what asked for it. */
export function ItemInfo() {
  const { shown, close } = useShowInfo();
  if (shown === undefined) return null;
  return <InfoCard key={shown.target.typeId} shown={shown} onClose={close} />;
}

function InfoCard({ shown: { target, anchor }, onClose }: { shown: ShownInfo; onClose: () => void }) {
  const images = useImages();
  const { type, fitted, attributes } = useInfo(target);
  const price = useTypePrice(target.typeId);
  const card = useRef<HTMLElement>(null);
  const anchorName = `--item-info-${useId().replace(/[^\w-]/g, "")}`;
  const tabId = useId();

  useLayoutEffect(() => {
    const element = anchor?.element;
    if (!(element instanceof HTMLElement)) return;
    const inline = element.style.getPropertyValue("anchor-name");
    const own = getComputedStyle(element).getPropertyValue("anchor-name");
    element.style.setProperty("anchor-name", own && own !== "none" ? `${own}, ${anchorName}` : anchorName);
    return () => element.style.setProperty("anchor-name", inline);
  }, [anchor, anchorName]);

  useEffect(() => {
    card.current?.showPopover();
    const element = anchor?.element;
    if (element === undefined) return;

    const gone = new MutationObserver(() => {
      if (!element.isConnected) onClose();
    });
    gone.observe(document.body, { childList: true, subtree: true });
    const hidden = new ResizeObserver(([entry]) => {
      if (entry?.contentRect.width === 0 && entry.contentRect.height === 0) onClose();
    });
    hidden.observe(element);
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && card.current?.contains(event.target))) onClose();
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      gone.disconnect();
      hidden.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [anchor, onClose]);

  return (
    <section
      ref={card}
      className={styles.card}
      popover="auto"
      onToggle={(event) => {
        if (event.newState === "closed") onClose();
      }}
      aria-label={`Info on ${type?.name ?? ""}`}
      data-side={anchor?.side}
      style={{ "--item-info-anchor": anchorName } as CSSProperties}
    >
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <Icon name="close" />
      </button>
      <header className={styles.header}>
        <span className={styles.typeIcon}>
          <TypeIcon typeId={target.typeId} size={64} />
        </span>
        <div className={styles.title}>
          <h2 className={styles.name}>{type?.name}</h2>
          {price !== undefined && (
            <span className={styles.muted}>{formatNumber(price, { decimals: 0 })} ISK Est. price</span>
          )}
          <span>
            {fitted === undefined ? "Not fitted" : `${fitted.charge ? "Loaded" : "Fitted"} · ${slotName(fitted.slot)}`}
          </span>
        </div>
      </header>
      <div className={styles.tabs} role="tablist">
        <button type="button" id={tabId} className={styles.tab} role="tab" aria-selected>
          Attributes
        </button>
      </div>
      <div className={styles.panel} role="tabpanel" aria-labelledby={tabId}>
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
      </div>
    </section>
  );
}

function slotName(slot: Slot): string {
  const name = slotNames[slot.type] ?? slot.type;
  return "index" in slot ? `${name} ${slot.index + 1}` : name;
}
