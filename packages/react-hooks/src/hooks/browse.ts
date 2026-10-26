import { BrowseContext, useRequiredContext, type BrowseRequest, type BrowseTarget } from "../context.js";

export interface Browse {
  /** The latest request; a new object each time, also for the same target. */
  readonly request: BrowseRequest | undefined;
  /** Asks the item browser to show what fits in `target`. */
  readonly browse: (target: BrowseTarget) => void;
}

export function useBrowse(): Browse {
  const { request, setRequest } = useRequiredContext(BrowseContext);
  return { request, browse: (target) => setRequest({ target }) };
}
