import type { Rack } from "@eveshipfit/fitting";

import { BrowseContext, useRequiredContext, type BrowseRequest } from "../context.js";

export interface Browse {
  /** The latest request; a new object each time, also for the same rack. */
  readonly request: BrowseRequest | undefined;
  /** Asks the item browser to show what fits in `rack`. */
  readonly browse: (rack: Rack) => void;
}

export function useBrowse(): Browse {
  const { request, setRequest } = useRequiredContext(BrowseContext);
  return { request, browse: (rack) => setRequest({ rack }) };
}
