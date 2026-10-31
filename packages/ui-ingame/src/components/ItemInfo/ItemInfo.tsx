import type { FitStore, Slot } from "@eveshipfit/fitting";
import {
  formatNumber,
  useCharges,
  useFit,
  useFitStore,
  useImages,
  useInfo,
  usePreview,
  useSde,
  useShowInfo,
  useTypePrice,
  type Info,
  type InfoAttribute,
  type ShownInfo,
} from "@eveshipfit/react-hooks";
import type { SdeType } from "@eveshipfit/sde-loader";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

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
  const { typeId, ref } = shown.target;
  return <InfoCard key={ref === undefined ? `type ${typeId}` : `item ${ref}`} shown={shown} onClose={close} />;
}

type Tab = "attributes" | "variations";

function InfoCard({ shown: { target, anchor }, onClose }: { shown: ShownInfo; onClose: () => void }) {
  const info = useInfo(target);
  const { type, fitted, ship, variations } = info;
  const price = useTypePrice(target.typeId);
  const card = useRef<HTMLElement>(null);
  const anchorName = `--item-info-${useId().replace(/[^\w-]/g, "")}`;
  const tabId = useId();
  const [picked, setPicked] = useState<Tab>("attributes");
  const tabs: Tab[] = variations.length > 1 ? ["attributes", "variations"] : ["attributes"];
  const tab = tabs.includes(picked) ? picked : "attributes";

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
            {ship
              ? "Hull"
              : fitted === undefined
                ? "Not fitted"
                : `${fitted.charge ? "Loaded" : "Fitted"} · ${slotName(fitted.slot)}`}
          </span>
        </div>
      </header>
      <div className={styles.tabs} role="tablist">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            id={`${tabId}-${name}`}
            className={styles.tab}
            role="tab"
            aria-selected={name === tab}
            onClick={() => setPicked(name)}
          >
            {tabLabels[name]}
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel" aria-labelledby={`${tabId}-${tab}`}>
        {tab === "attributes" ? (
          <Attributes attributes={info.attributes} />
        ) : (
          <Variations shown={{ target, anchor }} info={info} />
        )}
      </div>
    </section>
  );
}

const tabLabels: Record<Tab, string> = { attributes: "Attributes", variations: "Variations" };

function Attributes({ attributes }: { attributes: readonly InfoAttribute[] }) {
  const images = useImages();
  return (
    <dl className={styles.list}>
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
  );
}

const PREVIEW_TARGET = "item-info";

/** By meta group; when fitted, hovering one previews it in place of the fitted one, and double clicking fits it there. */
function Variations({ shown: { target, anchor }, info: { fitted, variations } }: { shown: ShownInfo; info: Info }) {
  const sde = useSde();
  const store = useFitStore();
  const preview = usePreview();
  const { show } = useShowInfo();
  const { ref } = target;

  const clearPreview = useEffectEvent(() => preview.clear(PREVIEW_TARGET));
  useEffect(() => () => clearPreview(), []);

  const fit = useFit();
  const module = typeof ref === "number" ? fit.items[ref] : undefined;
  const charges = useCharges(fitted?.charge ? module?.type_id : undefined);
  const swapper = (type: SdeType) => {
    if (fitted === undefined || typeof ref !== "number") return undefined;
    if (fitted.charge && !charges.includes(type)) return undefined;
    const swap = (draft: FitStore) => (fitted.charge ? draft.setCharge(ref, type.id) : draft.setType(ref, type.id));
    return {
      hover: (hovering: boolean) => {
        if (hovering) preview.show(swap, PREVIEW_TARGET);
        else preview.clear(PREVIEW_TARGET);
      },
      activate: () => {
        swap(store);
        const item = store.getSnapshot().fit.items[ref];
        if ((fitted.charge ? item?.charge?.type_id : item?.type_id) === type.id) show({ typeId: type.id, ref }, anchor);
      },
    };
  };

  const groups = Map.groupBy(variations, (type) => type.metaGroupId);

  return (
    <ul className={styles.list}>
      {[...groups].map(([metaGroupId, types]) => (
        <li key={metaGroupId ?? 0}>
          <h3 className={styles.metaGroup}>{sde.metaGroup(metaGroupId ?? 0)?.name ?? "Other"}</h3>
          <ul className={styles.variations}>
            {types.map((type) => {
              const swap = swapper(type);
              return (
                <Variation
                  key={type.id}
                  type={type}
                  current={type.id === target.typeId}
                  onHover={swap?.hover}
                  onActivate={swap?.activate}
                  onInfo={() => show({ typeId: type.id }, anchor)}
                />
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

interface VariationProps {
  type: SdeType;
  current: boolean;
  onHover: ((hovering: boolean) => void) | undefined;
  onActivate: (() => void) | undefined;
  onInfo: () => void;
}

function Variation({ type, current, onHover, onActivate, onInfo }: VariationProps) {
  const label = (
    <>
      <span className={styles.variationIcon}>
        <TypeIcon typeId={type.id} />
      </span>
      <span>{type.name}</span>
    </>
  );
  return (
    <li className={styles.row} aria-current={current || undefined}>
      {current || onActivate === undefined ? (
        <div className={styles.variation}>{label}</div>
      ) : (
        <button
          type="button"
          className={styles.variation}
          title="Double click to fit this instead"
          onDoubleClick={onActivate}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            onActivate();
          }}
          onMouseEnter={() => onHover?.(true)}
          onMouseLeave={() => onHover?.(false)}
          onFocus={() => onHover?.(true)}
          onBlur={() => onHover?.(false)}
        >
          {label}
        </button>
      )}
      <button type="button" className={styles.info} aria-label={`Show Info on ${type.name}`} onClick={onInfo}>
        <Icon name="module-info" />
      </button>
    </li>
  );
}

function slotName(slot: Slot): string {
  const name = slotNames[slot.type] ?? slot.type;
  if (!("index" in slot)) return name;
  const numbered = slot.type === "implant" || slot.type === "booster";
  return `${name} ${numbered ? slot.index : slot.index + 1}`;
}
