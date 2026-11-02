import type { InfoAnchor } from "@eveshipfit/react-hooks";
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";

/** Opens a popover card next to `anchor`; closes it when the anchor goes away or the page scrolls under it. */
export function useAnchoredCard(
  anchor: InfoAnchor | undefined,
  onClose: () => void,
): { card: RefObject<HTMLElement | null>; style: CSSProperties } {
  const card = useRef<HTMLElement>(null);
  const anchorName = `--item-info-${useId().replace(/[^\w-]/g, "")}`;
  const close = useEffectEvent(onClose);

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
      if (!element.isConnected) close();
    });
    gone.observe(document.body, { childList: true, subtree: true });
    const hidden = new ResizeObserver(([entry]) => {
      if (entry?.contentRect.width === 0 && entry.contentRect.height === 0) close();
    });
    hidden.observe(element);
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && card.current?.contains(event.target))) close();
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      gone.disconnect();
      hidden.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [anchor]);

  return { card, style: { "--item-info-anchor": anchorName } as CSSProperties };
}
